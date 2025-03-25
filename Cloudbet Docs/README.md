[Cloudbet](https://www.cloudbet.com/) API schemas provide details about JSON objects returned within the [Cloudbet API](https://docs.cloudbet.com/).

These schemas applies to the [Cloudbet Feed API](https://docs.cloudbet.com/?urls.primaryName=Feed) and [Cloudbet Trading API](https://docs.cloudbet.com/?urls.primaryName=Trading)

1. `sports.json` : List of all sports available with the Cloudbet API
2. `categories.json` : List of all categories of competitions available with the Cloudbet API
3. `markets.json`: List of all markets available with the Cloudbet API

Special Note about handicap markets:

**For handicap markets, a line is identified by the same params. Selections can be grouped by market key and params alone. Home and away outcomes then have the same market URL for the same handicap lines. The handicap value is dictated by the home team value and inverted on the away side.**


For further code samples and API response samples, please refer to the [Cloudbet Docs repository on Github](https://github.com/Cloudbet/docs)