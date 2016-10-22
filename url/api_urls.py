from api.account import RecentAccountsAPI, AccountSearchAPI, AccountCountsBreakdownByCreatedDateAPI
from api.alarm import AlarmsAPI, AlarmsByEmailAPI, AlarmRingsHistoryAPI
from api.calibration import DustCalibrationAPI, DustOffsetAPI, DustCalibrationLeftOverPairsAPI
from api.elasticsearch import SenseLogsElasticSearchAPI, ElasticSearchStatusAPI
from api.elasticsearch import ElasticSearchAggregationAPI, DustStatsAPI, DeviceStatsAPI
from api.feedback import FeedbackAPI
from api.insights import InsightsAPI, InsightsGenericAPI
from api.logs_level import LogsLevelAPI
from api.namespace import NamespaceAPI
from api.password import PasswordResetAPI, PasswordForceUpdateAPI
from api.feature import FeaturesAPI
from api.device import ActiveDevices15MinutesHistoryAPI, PillColorAPI, DropoutDevicesAPI
from api.device import ActiveDevicesDailyHistoryAPI
from api.device import ActiveDevicesMinuteHistoryAPI
from api.device import DeviceAPI
from api.device import DeviceByEmailAPI
from api.device import DeviceInactiveAPI
from api.device import DeviceKeyStoreAPI
from api.device import DeviceOwnersAPI
from api.device import SenseBlackListAPI
from api.device import SenseColorAPI
from api.pill import LastHeartbeatAPI, HeartbeatsAPI, LatestPillsAPI, LatestPillsDataAPI
from api.sessions import SessionsAPI, SessionsUpdateAPI
from api.trends import TrendsAPI
from api.uptime import SenseUptimeAPI
from api.uptime import UptimeByFirmwareGroupAPI
from api.event import SenseEventsAPI
from api.filemanifest import FileManifestAPI
from api.firmware import FirmwareAPI
from api.firmware import FirmwareHistoryAPI
from api.firmware import FirmwareInfoAPI
from api.firmware import FirmwareUnhashAPI
from api.firmware import FirmwareGroupStatusAPI
from api.firmware import FirmwareGroupPathAPI
from api.firmware import FirmwareVersionMapAPI
from api.keystore import SenseKeyStoreBatchAPI, PillKeyStoreBatchAPI
from api.keystore import SenseKeyProvision
from api.label import LabelDataAPI
from api.motion import MotionAPI, LastMotionAPI
from api.notification import NotificationAPI
from api.onboarding import OnboardingLogsByResultAPI
from api.onboarding import OnboardingLogsBySenseIdAPI
from api.onboarding import OnboardingLogsByEmailAPI
from api.order import OrdersAPI
from api.papertrail import PaperTrailEventsAPI
from api.papertrail import PaperTrailSystemsAPI
from api.pch import PCHSerialNumberCheckAPI
from api.battery import BatteryAPI
from api.room_conditions import LastRoomConditionsAPI
from api.room_conditions import RoomConditionsAPI
from api.searchify import LogsFacetHistoryAPI
from api.searchify import LogsFacetAPI
from api.searchify import SenseLogsAPI, SearchifyStatsAPI
from api.searchify import WifiSignalStrengthAPI
from api.setup import AppAPI
from api.setup import AppendAppInfo
from api.setup import AppScopeAPI
from api.setup import CreateAccountAPI
from api.setup import CreateKeyStoreLockerAPI
from api.setup import ProxyAPI
from api.setup import RegisterPillAPI, SetupAPI
from api.setup import TokenAPI
from api.setup import UpdateAdminAccessTokenAPI
from api.setup import UpdateGeckoBoardCredentials
from api.setup import ViewPermissionAPI
from api.fw_groups import FWGroupAPI
from api.tags import TagsAPI
from api.tags import DeviceTagsAPI
from api.timeline import TimelineAPI, TimelineV2API, TimelineLogsAPI, TimelineLogsHistoryAPI
from api.timezone import TimezoneAPI
from api.timezone import TimezoneHistoryAPI
from api.wifi import WifiInfoAPI
from api.zendesk import ZendeskAPI
from api.zendesk import ZendeskHistoryAPI
from api.zendesk import ZendeskNowAPI
from api.zendesk import ZendeskStatsAPI
from api.order import OrdersMapAPI
from api.timeline import TimelineAlgorithmAPI
from api.device import ColorlessSensesAPI
from api.clearbit import ClearbitAPI
from api.setup import CreateBuggyFirmwareAPI
from api.datastore import InitializeDataStore
from api.store import StoreAPI

routes = [
    ('/api/account_breakdown/?$', AccountCountsBreakdownByCreatedDateAPI),
    ('/api/active_devices_15_minutes_history/?$', ActiveDevices15MinutesHistoryAPI),
    ('/api/active_devices_daily_history/?$', ActiveDevicesDailyHistoryAPI),
    ('/api/active_devices_minute_history/?$', ActiveDevicesMinuteHistoryAPI),
    ('/api/alarm_rings_history/?$', AlarmRingsHistoryAPI),
    ('/api/alarms/?$', AlarmsAPI),
    ('/api/alarms_by_email/?$', AlarmsByEmailAPI),
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/append_app_info/?$', AppendAppInfo),
    ('/api/battery/?$', BatteryAPI),
    ('/api/create_key_store_locker/?$', CreateKeyStoreLockerAPI),
    ('/api/device_by_email/?$', DeviceByEmailAPI),
    ('/api/devices/?$', DeviceAPI),
    ('/api/devices/inactive/?$', DeviceInactiveAPI),
    ('/api/devices/key_store/?$', DeviceKeyStoreAPI),
    ('/api/devices/owners/?$', DeviceOwnersAPI),
    ('/api/sense_uptime/?$', SenseUptimeAPI),
    ('/api/uptime/(\w+)', UptimeByFirmwareGroupAPI),
    ('/api/dust_stats/?$', DustStatsAPI),
    ('/api/device_stats/?$', DeviceStatsAPI),
    ('/api/features/?$', FeaturesAPI),
    ('/api/files/(\w+)', FileManifestAPI),
    ('/api/firmware/?$', FirmwareAPI),
    ('/api/firmware/history/?$', FirmwareHistoryAPI),
    ('/api/firmware/info/?$', FirmwareInfoAPI),
    ('/api/firmware_unhash/?$', FirmwareUnhashAPI),
    ('/api/firmware_group_status/?$', FirmwareGroupStatusAPI),
    ('/api/firmware_group_path/?$', FirmwareGroupPathAPI),
    ('/api/password_force_update/?$', PasswordForceUpdateAPI),
    ('/api/label_data/?$', LabelDataAPI),
    ('/api/last_room_conditions/?$', LastRoomConditionsAPI),
    ('/api/logs_facet/?$', LogsFacetAPI),
    ('/api/motion/?$', MotionAPI),
    ('/api/notification/?$', NotificationAPI),
    ('/api/onboarding_logs_by_result/?$', OnboardingLogsByResultAPI),
    ('/api/onboarding_logs_by_sense_id/?$', OnboardingLogsBySenseIdAPI),
    ('/api/onboarding_logs_by_email/?$', OnboardingLogsByEmailAPI),
    ('/api/orders/?$', OrdersAPI),
    ('/api/papertrail_events/?$', PaperTrailEventsAPI),
    ('/api/papertrail_systems/?$', PaperTrailSystemsAPI),
    ('/api/password_reset/?$', PasswordResetAPI),
    ('/api/pch_sn_check/?$', PCHSerialNumberCheckAPI),
    ('/api/recent_accounts/?$', RecentAccountsAPI),
    ('/api/room_conditions/?$', RoomConditionsAPI),
    ('/api/searchify_stats/?$', SearchifyStatsAPI),
    ('/api/sense_black_list/?$', SenseBlackListAPI),
    ('/api/sense_color/?$', SenseColorAPI),
    ('/api/sense_events/?$', SenseEventsAPI),
    ('/api/sense_key_provision/?$', SenseKeyProvision),
    ('/api/sense_logs/?$', SenseLogsAPI),
    ('/api/fw_groups/?$', FWGroupAPI),
    ('/api/fw_map/?$', FirmwareVersionMapAPI),
    ('/api/tags/?$', TagsAPI),
    ('/api/device_tags/?$', DeviceTagsAPI),
    ('/api/timeline/?$', TimelineAPI),
    ('/api/timeline_algorithm/?$', TimelineAlgorithmAPI),
    ('/api/timezone/?$', TimezoneAPI),
    ('/api/timezone_history/?$', TimezoneHistoryAPI),
    ('/api/tokens/?$', TokenAPI),
    ('/api/update_geckoboard_credentials/?$', UpdateGeckoBoardCredentials),
    ('/api/account_search/?$', AccountSearchAPI),
    ('/api/viewer_permission/?$', ViewPermissionAPI),
    ('/api/wifi_signal_strength/?$', WifiSignalStrengthAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/zendesk_history/?$', ZendeskHistoryAPI),
    ('/api/zendesk_now/?$', ZendeskNowAPI),
    ('/api/zendesk_stats/?$', ZendeskStatsAPI),
    ('/api/orders_map/?$', OrdersMapAPI),
    ('/api/colorless_senses/?$', ColorlessSensesAPI),
    ('/api/clearbit/?$', ClearbitAPI),
    ('/api/create/buggy_firmware/?$', CreateBuggyFirmwareAPI),
    ("/api/init/?$", InitializeDataStore),
    ("/api/namespace/?$", NamespaceAPI),
    ('/update', UpdateAdminAccessTokenAPI),
    ('/proxy/(.*)', ProxyAPI),
    ('/register_pill', RegisterPillAPI),
    ('/api/setup', SetupAPI),
    ('/create_account', CreateAccountAPI),
    ('/api/timeline_v2/?$', TimelineV2API),
    ('/api/dust_calibration/?$', DustCalibrationAPI),
    ('/api/dust_offset/?$', DustOffsetAPI),
    ('/api/wifi_info/?$', WifiInfoAPI),
    ('/api/timeline_logs/?$', TimelineLogsAPI),
    ('/api/timeline_logs_history/?$', TimelineLogsHistoryAPI),
    ('/api/logs_facet_history/?$', LogsFacetHistoryAPI),
    ('/api/pill_color/?$', PillColorAPI),
    ('/api/last_heartbeat/?$', LastHeartbeatAPI),
    ('/api/heartbeats/?$', HeartbeatsAPI),
    ('/api/dust_calibration_left_over/?$', DustCalibrationLeftOverPairsAPI),
    ('/api/last_motion/?$', LastMotionAPI),
    ('/api/sense_logs_es/?$', SenseLogsElasticSearchAPI),
    ('/api/sense_key_store/?$', SenseKeyStoreBatchAPI),
    ('/api/pill_key_store/?$', PillKeyStoreBatchAPI),
    ('/api/logs_level/?$', LogsLevelAPI),
    ('/api/es_status/?$', ElasticSearchStatusAPI),
    ('/api/es_aggregation/?$', ElasticSearchAggregationAPI),
    ('/api/feedback/?$', FeedbackAPI),
    ('/api/feedback/?$', FeedbackAPI),
    ('/api/insights/?$', InsightsAPI),
    ('/api/insights_generic/?$', InsightsGenericAPI),
    ('/api/trends/?$', TrendsAPI),
    ('/api/sessions/?$', SessionsAPI),
    ('/api/sessions_update/?$', SessionsUpdateAPI),
    ('/api/dropout_devices/?$', DropoutDevicesAPI),
    ('/api/pill_latest/pair/?$', LatestPillsAPI),
    ('/api/pill_latest/data/?$', LatestPillsDataAPI),
    ('/api/store/search/?$', StoreAPI),
]

