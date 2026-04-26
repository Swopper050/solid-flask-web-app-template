from marshmallow import fields


class UTCDateTime(fields.DateTime):
    """Serialize naive datetimes as UTC ISO 8601 strings (with 'Z' suffix).

    The database stores naive UTC datetimes. Without a timezone indicator,
    JavaScript's Date constructor treats them as local time, causing the
    computed diff to be off by the user's UTC offset. Appending 'Z' ensures
    JS always parses them as UTC.
    """

    def _serialize(self, value, attr, obj, **kwargs):
        result = super()._serialize(value, attr, obj, **kwargs)
        if result is not None and not result.endswith("Z") and "+" not in result:
            result += "Z"
        return result
