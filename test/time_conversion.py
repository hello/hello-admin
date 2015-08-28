import unittest
import datetime

from core.lib import pytz
from core.utils.time_helpers import iso_to_utc_timestamp, iso_to_pacific_datetime_obj, iso_to_human_timestring


utc_timezone = pytz.timezone("UTC")


class TestUtils(unittest.TestCase):

    def test_iso_to_utc_timestamp(self):
        test_input = "2014-11-06T10:34:47Z"
        expected_output = 1415270087
        self.assertEqual(iso_to_utc_timestamp(test_input), expected_output)

    def test_iso_to_datetime_obj(self):
        test_input = "2014-11-06T10:34:47Z"
        expected_output = utc_timezone.localize(datetime.datetime(2014, 11, 6, 10, 34, 47))
        self.assertEqual(iso_to_pacific_datetime_obj(test_input), expected_output)

    def test_iso_to_human_timestring(self):
        test_input = "2014-11-06T10:34:47Z"
        expected_output = "11-06-2014 10:34:47"
        self.assertEqual(iso_to_human_timestring(test_input), expected_output)

if __name__ == '__main__':
    unittest.main()
