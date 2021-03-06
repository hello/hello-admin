from cron.datastore_cron import ActiveDevicesHistory15MinutesPurge, ActiveDevicesHistoryPurge, \
    StoreRecentlyActiveDevicesStats15Minutes, StoreRecentlyActiveDevicesStatsDaily, \
    StoreRecentlyActiveDevicesStatsMinute
from cron.dust_calibration_cron import DustCalibrationUpdateQueue, DustCalibrationUpdate, \
    DustCalibrationLeftOverUpdateQueue, DustCalibrationLeftOverUpdate
from cron.elasticsearch_cron import FirmwareCrashElasticSearchAlert, ElasticSearchDropIndex, UnexpectedFirmwareAlert
from cron.firmware_cron import FirmwareLogsAlert, StoreLogsFacet, StoreLogsFacetQueue
from cron.geckoboard_cron import AlarmsCountPush, DevicesCountPush, DeviceTotalsPush
from cron.searchify_cron import DropOldSenseLogsSearchifyIndex
from cron.sense_color_cron import SenseColorUpdate, SenseColorUpdateQueue
from cron.timezone_cron import UpdateTimezoneByPartnerQueue, UpdateTimezoneByPartner
from cron.zendesk_cron import ZendeskCron


routes = [
    ('/cron/active_devices_history_15_minutes_purge', ActiveDevicesHistory15MinutesPurge),
    ('/cron/active_devices_history_purge', ActiveDevicesHistoryPurge),
    ('/cron/alarms_count_push', AlarmsCountPush),
    ('/cron/devices_count_push', DevicesCountPush),
    ('/cron/device_totals_push', DeviceTotalsPush),
    ('/cron/drop_old_sense_logs_searchify_index', DropOldSenseLogsSearchifyIndex),
    ('/cron/store_recently_active_devices_stats_15_minutes', StoreRecentlyActiveDevicesStats15Minutes),
    ('/cron/store_recently_active_devices_stats_daily', StoreRecentlyActiveDevicesStatsDaily),
    ('/cron/store_recently_active_devices_stats_minute', StoreRecentlyActiveDevicesStatsMinute),
    ('/cron/zendesk_daily_stats', ZendeskCron),
    ('/cron/sense_color_update', SenseColorUpdate),
    ('/cron/sense_color_update_queue', SenseColorUpdateQueue),
    ('/cron/firmware_crash_logs_retain', FirmwareLogsAlert),
    ('/cron/update_timezone_by_partner', UpdateTimezoneByPartner),
    ('/cron/update_timezone_by_partner_queue', UpdateTimezoneByPartnerQueue),
    ('/cron/store_logs_facet/?$', StoreLogsFacet),
    ('/cron/store_logs_facet_queue/?$', StoreLogsFacetQueue),
    ('/cron/dust_calibration_update/?$', DustCalibrationUpdate),
    ('/cron/dust_calibration_update_queue/?$', DustCalibrationUpdateQueue),
    ('/cron/dust_calibration_leftover_update/?$', DustCalibrationLeftOverUpdate),
    ('/cron/dust_calibration_leftover_update_queue/?$', DustCalibrationLeftOverUpdateQueue),
    ('/cron/firmware_crash_alert_es/?$', FirmwareCrashElasticSearchAlert),
    ('/cron/es_drop/?$', ElasticSearchDropIndex),
    ('/cron/unexpected_firmware/?$', UnexpectedFirmwareAlert),
]
