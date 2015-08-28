from collections import Counter, defaultdict
from core.utils import time_helpers


def get_zendesk_stats(tickets):
    """
    :param tickets: list of ticket objects (dicts) returned by zendesk api
    :type tickets: list
    :return: dict
    """
    status_counter = Counter()
    recipient_counter = Counter()
    tickets_by_date = defaultdict(list)
    for t in tickets:
        status_counter += Counter([t['status']])
        recipient_counter += Counter([t['recipient']])
        created_date = t['created_at'].split('T')[0]
        tickets_by_date[created_date].append(t)

    output_data = {
        'total_breakdown': {
            'status': status_counter,
            'recipient': recipient_counter
        },
        'daily_breakdown': {},
        'bar_charts': {},
        'z': tickets[0]
    }

    for date, content in tickets_by_date.iteritems():
        status_counter_by_date = Counter()
        recipient_counter_by_date = Counter()
        for c in content:
            status_counter_by_date += Counter([c['status']])
            recipient_counter_by_date += Counter([c['recipient']])
        output_data['daily_breakdown'][date] = {
            'status': dict(status_counter_by_date),
            'recipient': dict(recipient_counter_by_date)
        }

    bingo_status = []
    for k in status_counter.keys():
        status_set = [{'x': date,
                       'y': stats['status'].get(k, 0)}
               for date, stats in output_data['daily_breakdown'].iteritems()]
        status_set = sorted(status_set, key=lambda t: int(time.mktime(time.strptime(t['x'], '%Y-%m-%d'))))
        bingo_status.append({'key': k or 'unknown status', 'values': status_set})
    bingo_recipient = []
    for k in recipient_counter.keys():
        recipient_set = [{'x': date, 'y': stats['recipient'].get(k, 0)}
               for date, stats in output_data['daily_breakdown'].iteritems()]
        bingo_recipient.append({'key': k or 'unknown recipient', 'values': recipient_set})
    output_data['bar_charts'] = {
        'status': bingo_status,
        'recipient': bingo_recipient
    }
    return output_data