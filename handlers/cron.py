import datetime
import json
import logging as log
import requests
from handlers.analysis import get_zendesk_stats
from handlers.helpers import BaseRequestHandler
from handlers.utils import display_error
from handlers.utils import get_current_pacific_datetime
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials
from models.ext import ZendeskDailyStats
from indextank import ApiClient

from google.appengine.api import taskqueue
class ZendeskCronHandler(BaseRequestHandler):
    def get(self):
        output = {'data': []}
        info_query = ZendeskCredentials.query()
        results = info_query.fetch(1)

        if not results:
            self.error(500)

        zendesk_cred = results[0]
        tickets = []

        zen_api = "{}/api/v2/search.json?query=type:ticket%20".format(zendesk_cred.domain)

        end_date = (get_current_pacific_datetime()).strftime('%Y-%m-%d')
        start_date = (get_current_pacific_datetime() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        date_type = "created"

        search_url = zen_api + "{}>{}+{}<{}".format(date_type, start_date, date_type, end_date)

        zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)
        try:
            zen_response = requests.get(search_url, auth=zen_auth)

            if zen_response.ok:
                tickets += zen_response.json().get('results', [])
            else:
                raise RuntimeError("Fail to retrieve tickets")

            # Keep querying on as long as paginating is possible
            while zen_response.json().get('next_page') is not None:
                print len(tickets)
                zen_response = requests.get(zen_response.json().get('next_page'), auth=zen_auth)
                if zen_response.ok:
                    tickets += zen_response.json().get('results', [])

            # tickets = sorted(tickets, key=lambda k: iso_to_utc_timestamp(k.get('created_at')))

            if not tickets:
                raise RuntimeError("There is no ticket for specified query")

            output['data'] = get_zendesk_stats(tickets)
            log.info(output)

            tickets_status = output['data']['total_breakdown']['status']
            zendesk_cron_stats = ZendeskDailyStats(
                new_tickets=tickets_status['new'],
                open_tickets=tickets_status['open'],
                pending_tickets=tickets_status['pending'],
                solved_tickets=tickets_status['solved'],
                closed_tickets=tickets_status['closed']
            )

            zendesk_cron_stats.put()

        except Exception as e:
            log.error('ERROR: {}'.format(display_error(e)))


class SearchifyHandler(BaseRequestHandler):
    def get_searchify_index(self, index):
        searchify_entity= SearchifyCredentials.query().fetch(1)
        if not searchify_entity:
            raise RuntimeError("Missing AppInfo. Bailing.")
        return ApiClient(searchify_entity[0].api_client).get_index(index)

    def identify_old_docs(self, index, query, time_threshold, start, limit):
        delete_docid_list = []
        # Customize function 100 to present oldest documents first regardless of relevance to query
        index.add_function(100, "age + 0*relevance")
        search_uploading = index.search(query=query, fetch_fields=['timestamp'], start=start, length=limit, scoring_function=100)['results']

        for s in search_uploading:
            if datetime.datetime.fromtimestamp(int(s['timestamp'])) < time_threshold:
                delete_docid_list.append(s['docid'])
        return delete_docid_list

    def gather_purge_ids(self, index, query_keywords, time_threshold, maxdocs=50):
        old_docs_list = []
        for q in query_keywords:
            old_docs_list += self.identify_old_docs(index=index, query=q, time_threshold=time_threshold, start=0, limit=50)
        return list(set(old_docs_list))[:maxdocs]

    def delete_old_docs(self, index, docid_list):
        return index.delete_documents(docid_list)


class SenseLogsPurge(SearchifyHandler):
    def get(self):
        sense_logs_index = self.get_searchify_index('sense-logs')

        old_docs_to_be_deleted_list = self.gather_purge_ids(
            sense_logs_index,
            ['text:uart', 'text:uploading', 'text:sending', 'text:complete', 'text:success', 'text:Texas', 'text:dev'],
            datetime.datetime.now() + datetime.timedelta(days=-14)
        )

        output = {
            'old_docs_to_be_deleted': old_docs_to_be_deleted_list,
            'count': len(old_docs_to_be_deleted_list),
            }
        try:
            output['searchify_response'] = self.delete_old_docs(sense_logs_index, old_docs_to_be_deleted_list)
        except Exception as e:
            output['error'] = e.message
        self.response.write(json.dumps(output))




class ApplicationLogsPurge(SearchifyHandler):
    def post(self):
        application_logs_index = self.get_searchify_index('application-logs')
        level = self.request.get('level')
        tolerance_in_days = int(self.request.get('tolerance_in_days', 7))

        output = {'level': level}

        try:
            old_docs_to_be_deleted_list = self.gather_purge_ids(
                application_logs_index,
                ['text:{}'.format(level)],
                datetime.datetime.now() - datetime.timedelta(days=tolerance_in_days),
                maxdocs=50
            )

            output.update({
                'old_docs_to_be_deleted': old_docs_to_be_deleted_list,
                'count': len(old_docs_to_be_deleted_list),
                'searchify_response': self.delete_old_docs(application_logs_index, old_docs_to_be_deleted_list)
            })

        except Exception as e:
            output['error'] = e.message
        self.response.write(json.dumps(output))


class ApplicationLogsPurgeQueue(SearchifyHandler):
    def get(self):
        queue_sizes = {
            'DEBUG': 3,
            'INFO': 3,
            'WARN': 1,
            'ERROR': 1,
        }

        tolerance_in_days = {
            'DEBUG': 4,
            'INFO': 4,
            'WARN': 7,
            'ERROR': 7,
        }

        for level in ['DEBUG', 'INFO', 'WARN', 'ERROR']:
            for j in range(queue_sizes[level]):
                taskqueue.add(
                    url='/cron/application_logs_purge',
                    params={
                        'level': 'DEBUG',
                        'tolerance_in_days': tolerance_in_days[level]
                    }
                )

        self.response.write(json.dumps({'queue': 'active'}))


