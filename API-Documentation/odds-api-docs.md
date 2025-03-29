[#](#page-frontmatter-title) Odds API Docs V4
=============================================

These docs are for version 4, the latest version of the API. Docs for version 3 can be [found here](/liveapi/guides/v3/).

[#](#overview) Overview
-----------------------

Get started with The Odds API in **3 steps**

**Step 1**

Get an API key via email

See plans

  
  

**Step 2**

Get a list of in-season sports

[Details](#get-sports)

**GET** [/v4/sports?apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports?apiKey=YOUR_API_KEY)

    {
      "key": "americanfootball_nfl",
      "group": "American Football",
      "title": "NFL",
      "description": "US Football",
      "active": true,
      "has_outrights": false
    },
    ...
    

  
  

**Step 3**

Use the sport **key** from step 2 to get a list of upcoming events and odds from different bookmakers

  
Use the `oddsFormat` parameter to show odds in either decimal or American format

[Details](#get-odds)

**GET** [/v4/sports/americanfootball\_nfl/odds?regions=us&oddsFormat=american&apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&oddsFormat=american&apiKey=YOUR_API_KEY)

    {
      "id": "bda33adca828c09dc3cac3a856aef176",
      "sport_key": "americanfootball_nfl",
      "commence_time": "2021-09-10T00:20:00Z",
      "home_team": "Tampa Bay Buccaneers",
      "away_team": "Dallas Cowboys",
      "bookmakers": [
      {
        "key": "fanduel",
        "title": "FanDuel",
        "last_update": "2021-06-10T10:46:09Z",
        "markets": [
        {
          "key": "h2h",
          "outcomes": [
            {
              "name": "Dallas Cowboys", 
              "price": 240 
            },
            {
              "name": "Tampa Bay Buccaneers", 
              "price": -303
            }
          ]
      ...

  
  

[#](#host) Host
---------------

All requests use the host `https://api.the-odds-api.com`

Connections that require IPv6 can use `https://ipv6-api.the-odds-api.com`

  

[#](#get-sports) GET sports
---------------------------

Returns a list of in-season sport objects. The sport key can be used as the `sport` parameter in other endpoints. This endpoint does not count against the usage quota.

### [#](#endpoint) Endpoint

**GET** /v4/sports/?apiKey={apiKey}

### [#](#parameters) Parameters

*   **apiKey**   The API key associated with your subscription. [See usage plans](/#get-access)
    
*   **all**   Optional - if this parameter is set to true (`all=true`), a list of both in and out of season sports will be returned
    

  

Try it out in the browser

[https://api.the-odds-api.com/v4/sports/?apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_API_KEY)

Viewing JSON in the browser is easier with a prettifier such as [JSON Viewer (opens new window)](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) for Chrome

### [#](#schema) Schema

For a detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/sports/get_v4_sports)

### [#](#example-request) Example Request

**GET** [https://api.the-odds-api.com/v4/sports/?apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_API_KEY)

### [#](#example-response) Example Response

    [
        {
            "key": "americanfootball_ncaaf",
            "group": "American Football",
            "title": "NCAAF",
            "description": "US College Football",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "americanfootball_nfl",
            "group": "American Football",
            "title": "NFL",
            "description": "US Football",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "americanfootball_nfl_super_bowl_winner",
            "group": "American Football",
            "title": "NFL Super Bowl Winner",
            "description": "Super Bowl Winner 2021/2022",
            "active": true,
            "has_outrights": true
        },
        {
            "key": "aussierules_afl",
            "group": "Aussie Rules",
            "title": "AFL",
            "description": "Aussie Football",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "baseball_mlb",
            "group": "Baseball",
            "title": "MLB",
            "description": "Major League Baseball",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "basketball_nba",
            "group": "Basketball",
            "title": "NBA",
            "description": "US Basketball",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "cricket_test_match",
            "group": "Cricket",
            "title": "Test Matches",
            "description": "International Test Matches",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "golf_masters_tournament_winner",
            "group": "Golf",
            "title": "Masters Tournament Winner",
            "description": "2022 WInner",
            "active": true,
            "has_outrights": true
        },
        {
            "key": "golf_the_open_championship_winner",
            "group": "Golf",
            "title": "The Open Winner",
            "description": "2021 WInner",
            "active": true,
            "has_outrights": true
        },
        {
            "key": "golf_us_open_winner",
            "group": "Golf",
            "title": "US Open Winner",
            "description": "2021 WInner",
            "active": true,
            "has_outrights": true
        },
        {
            "key": "icehockey_nhl",
            "group": "Ice Hockey",
            "title": "NHL",
            "description": "US Ice Hockey",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "mma_mixed_martial_arts",
            "group": "Mixed Martial Arts",
            "title": "MMA",
            "description": "Mixed Martial Arts",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "rugbyleague_nrl",
            "group": "Rugby League",
            "title": "NRL",
            "description": "Aussie Rugby League",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_australia_aleague",
            "group": "Soccer",
            "title": "A-League",
            "description": "Aussie Soccer",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_brazil_campeonato",
            "group": "Soccer",
            "title": "Brazil Série A",
            "description": "Brasileirão Série A",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_denmark_superliga",
            "group": "Soccer",
            "title": "Denmark Superliga",
            "description": "",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_finland_veikkausliiga",
            "group": "Soccer",
            "title": "Veikkausliiga - Finland",
            "description": "",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_japan_j_league",
            "group": "Soccer",
            "title": "J League",
            "description": "Japan Soccer League",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_league_of_ireland",
            "group": "Soccer",
            "title": "League of Ireland",
            "description": "Airtricity League Premier Division",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_norway_eliteserien",
            "group": "Soccer",
            "title": "Eliteserien - Norway",
            "description": "Norwegian Soccer",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_spain_segunda_division",
            "group": "Soccer",
            "title": "La Liga 2 - Spain",
            "description": "Spanish Soccer",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_sweden_allsvenskan",
            "group": "Soccer",
            "title": "Allsvenskan - Sweden",
            "description": "Swedish Soccer",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_sweden_superettan",
            "group": "Soccer",
            "title": "Superettan - Sweden",
            "description": "Swedish Soccer",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_uefa_european_championship",
            "group": "Soccer",
            "title": "UEFA Euro 2020",
            "description": "UEFA European Championship",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "soccer_usa_mls",
            "group": "Soccer",
            "title": "MLS",
            "description": "Major League Soccer",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "tennis_atp_french_open",
            "group": "Tennis",
            "title": "ATP French Open",
            "description": "Men's Singles",
            "active": true,
            "has_outrights": false
        },
        {
            "key": "tennis_wta_french_open",
            "group": "Tennis",
            "title": "WTA French Open",
            "description": "Women's Singles",
            "active": true,
            "has_outrights": false
        }
    ]

### [#](#response-headers) Response Headers

Calls to the /sports endpoint will not affect the quota usage. The following response headers are returned:

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs) Usage Quota Costs

This endpoint does not count against the usage quota.  
  

[#](#get-odds) GET odds
-----------------------

Returns a list of upcoming and live games with recent odds for a given sport, region and market

### [#](#endpoint-2) Endpoint

**GET** /v4/sports/{sport}/odds/?apiKey={apiKey}&regions={regions}&markets={markets}

### [#](#parameters-2) Parameters

*   **sport**   The sport key obtained from calling the /sports endpoint. `upcoming` is always valid, returning any live games as well as the next 8 upcoming games across all sports
    
*   **apiKey**   The API key associated with your subscription. [See usage plans](/#get-access)
    
*   **regions**   Determines the bookmakers to be returned. Valid regions are `us`, `us2` (United States), `uk` (United Kingdom), `au` (Australia) and `eu` (Europe). Multiple regions can be specified if comma delimited. See the [list of bookmakers by region](/sports-odds-data/bookmaker-apis.html).
    
*   **markets**   Optional - Determines which odds market is returned. Defaults to `h2h` (head to head / moneyline). Valid markets are `h2h` (moneyline), `spreads` (points handicaps), `totals` (over/under) and `outrights` (futures). Multiple markets can be specified if comma delimited. `spreads` and `totals` markets are mainly available for US sports and bookmakers at this time. Each specified market costs 1 against the usage quota, for each region.
    
    Lay odds are automatically included with `h2h` results for relevant betting exchanges (Betfair, Matchbook etc). These have a `h2h_lay` market key.
    
    For sports with outright markets (such as Golf), the market will default to `outrights` if not specified. Lay odds for outrights (`outrights_lay`) will automatically be available for relevant exchanges.
    
    For more info, see [descriptions of betting markets](/sports-odds-data/betting-markets.html).
    
*   **dateFormat**   Optional - Determines the format of timestamps in the response. Valid values are `unix` and `iso` (ISO 8601). Defaults to `iso`.
    
*   **oddsFormat**   Optional - Determines the format of odds in the response. Valid values are `decimal` and `american`. Defaults to `decimal`. When set to `american`, small discrepancies might exist for some bookmakers due to rounding errors.
    
*   **eventIds**   Optional - Comma-separated game ids. Filters the response to only return games with the specified ids.
    
*   **bookmakers**   Optional - Comma-separated list of bookmakers to be returned. If both `bookmakers` and `regions` are both specified, `bookmakers` takes priority. Bookmakers can be from any region. Every group of 10 bookmakers is the equivalent of 1 region. For example, specifying up to 10 bookmakers counts as 1 region. Specifying between 11 and 20 bookmakers counts as 2 regions.
    
*   **commenceTimeFrom**   Optional - filter the response to show games that commence on and after this parameter. Values are in ISO 8601 format, for example 2023-09-09T00:00:00Z. This parameter has no effect if the sport is set to 'upcoming'.
    
*   **commenceTimeTo**   Optional - filter the response to show games that commence on and before this parameter. Values are in ISO 8601 format, for example 2023-09-10T23:59:59Z. This parameter has no effect if the sport is set to 'upcoming'.
    
*   **includeLinks**   Optional - if "true", the response will include bookmaker links to events, markets, and betslips if available. Valid values are "true" or "false"
    
*   **includeSids**   Optional - if "true", the response will include source ids (bookmaker ids) for events, markets and outcomes if available. Valid values are "true" or "false". This field can be useful to construct your own links to handle variations in state or mobile app links.
    
*   **includeBetLimits**   Optional - if "true", the response will include the bet limit of each betting option, mainly available for betting exchanges. Valid values are "true" or "false"
    

  

Try it out in the browser

[https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=... (opens new window)](https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us&markets=h2h&apiKey=YOUR_API_KEY)

Viewing JSON in the browser is easier with a prettifier such as [JSON Viewer (opens new window)](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) for Chrome

### [#](#schema-2) Schema

For a detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/current%20events/get_v4_sports__sport__odds)

### [#](#example-request-2) Example Request

**GET** [https://api.the-odds-api.com/v4/sports/americanfootball\_nfl/odds/?apiKey=YOUR\_API\_KEY&regions=us&markets=h2h,spreads&oddsFormat=american (opens new window)](https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=YOUR_API_KEY&regions=us&markets=h2h,spreads&oddsFormat=american)

### [#](#example-response-2) Example Response

    [
        {
            "id": "bda33adca828c09dc3cac3a856aef176",
            "sport_key": "americanfootball_nfl",
            "commence_time": "2021-09-10T00:20:00Z",
            "home_team": "Tampa Bay Buccaneers",
            "away_team": "Dallas Cowboys",
            "bookmakers": [
                {
                    "key": "unibet",
                    "title": "Unibet",
                    "last_update": "2021-06-10T13:33:18Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -303
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -109,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -111,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "caesars",
                    "title": "Caesars",
                    "last_update": "2021-06-10T13:33:48Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -278
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -110,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -110,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "sugarhouse",
                    "title": "SugarHouse",
                    "last_update": "2021-06-10T13:34:07Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -305
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -109,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -112,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "draftkings",
                    "title": "DraftKings",
                    "last_update": "2021-06-10T13:33:26Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -305
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -109,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -112,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "pointsbetus",
                    "title": "PointsBet (US)",
                    "last_update": "2021-06-10T13:36:20Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 230
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -291
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -110,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -110,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "betonlineag",
                    "title": "BetOnline.ag",
                    "last_update": "2021-06-10T13:37:29Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -286
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -105,
                                    "point": 6
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -115,
                                    "point": -6
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "betmgm",
                    "title": "BetMGM",
                    "last_update": "2021-06-10T13:32:45Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 225
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -275
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -110,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -110,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "betrivers",
                    "title": "BetRivers",
                    "last_update": "2021-06-10T13:35:33Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -305
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -109,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -112,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "fanduel",
                    "title": "FanDuel",
                    "last_update": "2021-06-10T13:33:23Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 225
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -275
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -110,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -110,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "barstool",
                    "title": "Barstool Sportsbook",
                    "last_update": "2021-06-10T13:34:48Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -305
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -109,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -112,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "bovada",
                    "title": "Bovada",
                    "last_update": "2021-06-10T13:35:51Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -290
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -110,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -110,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                },
                {
                    "key": "williamhill_us",
                    "title": "William Hill (US)",
                    "last_update": "2021-06-10T13:34:10Z",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": 240
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -280
                                }
                            ]
                        },
                        {
                            "key": "spreads",
                            "outcomes": [
                                {
                                    "name": "Dallas Cowboys",
                                    "price": -110,
                                    "point": 6.5
                                },
                                {
                                    "name": "Tampa Bay Buccaneers",
                                    "price": -110,
                                    "point": -6.5
                                }
                            ]
                        }
                    ]
                }
            ]
        },
    ...

### [#](#response-headers-2) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-2) Usage Quota Costs

The usage quota cost is 1 per region per market.

    cost = [number of markets specified] x [number of regions specified]
    

  

**Examples**

*   **1 market, 1 region**  
    Cost: 1  
    Example `/v4/sports/americanfootball_nfl/odds?markets=h2h&regions=us&...`
    
*   **3 markets, 1 region**  
    Cost: 3  
    Example `/v4/sports/americanfootball_nfl/odds?markets=h2h,spreads,totals&regions=us&...`
    
*   **1 market, 3 regions**  
    Cost: 3  
    Example `/v4/sports/soccer_epl/odds?markets=h2h&regions=us,uk,eu&...`
    
*   **3 markets, 3 regions**  
    Cost: 9  
    Example: `/v4/sports/basketball_nba/odds?markets=h2h,spreads,totals&regions=us,uk,au&...`
    

  

Keeping track of quota usage

To keep track of usage credits, every API call includes the following response headers:

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#more-info) More info

*   The list of events returned in the /odds endpoint mirrors events that are listed by major bookmakers. This usually includes games for the current round
*   Events may temporarily become unavailable after a round, before bookmakers begin listing the next round of games
*   Events may be unavailable if the sport is not in season. For popular sports, bookmakers may begin listing new season events a few months in advance
*   If no events are returned, the request will not count against the usage quota
*   To determine if an event is in-play, the `commence_time` can be used. If `commence_time` is less than the current time, the event is in-play. The /odds endpoint does not return completed events

  
  

[#](#get-scores) GET scores
---------------------------

Returns a list of upcoming, live and recently completed games for a given sport. Live and recently completed games contain scores. Games from up to 3 days ago can be returned using the `daysFrom` parameter. Live scores update approximately every 30 seconds.

The scores endpoint applies to selected sports and is gradually being expanded to more sports. See the current [list of covered sports and leagues](/sports-odds-data/sports-apis.html).

### [#](#endpoint-3) Endpoint

**GET** /v4/sports/{sport}/scores/?apiKey={apiKey}&daysFrom={daysFrom}&dateFormat={dateFormat}

### [#](#parameters-3) Parameters

*   **sport**   The sport key obtained from calling the /sports endpoint.
    
*   **apiKey**   The API key associated with your subscription. [See usage plans](/#get-access)
    
*   **daysFrom**   Optional - The number of days in the past from which to return completed games. Valid values are integers from `1` to `3`. If this parameter is missing, only live and upcoming games are returned.
    
*   **dateFormat**   Optional - Determines the format of timestamps in the response. Valid values are `unix` and `iso` (ISO 8601). Defaults to `iso`.
    
*   **eventIds**   Optional - Comma-separated game ids. Filters the response to only return games for the specified game ids.
    

### [#](#schema-3) Schema

For the detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/current%20events/get_v4_sports__sport__scores)

### [#](#example-request-3) Example Request

**GET** [https://api.the-odds-api.com/v4/sports/basketball\_nba/scores/?daysFrom=1&apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports/basketball_nba/scores/?daysFrom=1&apiKey=YOUR_API_KEY)

### [#](#example-response-3) Example Response

    [
        {
            "id": "572d984e132eddaac3da93e5db332e7e",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T03:10:38Z",
            "completed": true,
            "home_team": "Sacramento Kings",
            "away_team": "Oklahoma City Thunder",
            "scores": [
                {
                    "name": "Sacramento Kings",
                    "score": "113"
                },
                {
                    "name": "Oklahoma City Thunder",
                    "score": "103"
                }
            ],
            "last_update": "2022-02-06T05:18:19Z"
        },
        {
            "id": "e2296d6d1206f8d185466876e2b444ea",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T03:11:26Z",
            "completed": true,
            "home_team": "Portland Trail Blazers",
            "away_team": "Milwaukee Bucks",
            "scores": [
                {
                    "name": "Portland Trail Blazers",
                    "score": "108"
                },
                {
                    "name": "Milwaukee Bucks",
                    "score": "137"
                }
            ],
            "last_update": "2022-02-06T05:21:01Z"
        },
        {
            "id": "8d8affc2e29bcafd3cdec8b414256cda",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T20:41:04Z",
            "completed": true,
            "home_team": "Denver Nuggets",
            "away_team": "Brooklyn Nets",
            "scores": [
                {
                    "name": "Denver Nuggets",
                    "score": "124"
                },
                {
                    "name": "Brooklyn Nets",
                    "score": "104"
                }
            ],
            "last_update": "2022-02-06T22:50:22Z"
        },
        {
            "id": "aae8b3294ab2de36e63c614e44e94d80",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T20:41:47Z",
            "completed": true,
            "home_team": "Minnesota Timberwolves",
            "away_team": "Detroit Pistons",
            "scores": [
                {
                    "name": "Minnesota Timberwolves",
                    "score": "118"
                },
                {
                    "name": "Detroit Pistons",
                    "score": "105"
                }
            ],
            "last_update": "2022-02-06T22:52:29Z"
        },
        {
            "id": "07767ff2952c6b025aa5584626db2910",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T20:42:13Z",
            "completed": true,
            "home_team": "Chicago Bulls",
            "away_team": "Philadelphia 76ers",
            "scores": [
                {
                    "name": "Chicago Bulls",
                    "score": "108"
                },
                {
                    "name": "Philadelphia 76ers",
                    "score": "119"
                }
            ],
            "last_update": "2022-02-06T22:58:23Z"
        },
        {
            "id": "3f63cadf65ad249c5bc6b1aac8ba426d",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T23:10:53Z",
            "completed": true,
            "home_team": "Orlando Magic",
            "away_team": "Boston Celtics",
            "scores": [
                {
                    "name": "Orlando Magic",
                    "score": "83"
                },
                {
                    "name": "Boston Celtics",
                    "score": "116"
                }
            ],
            "last_update": "2022-02-07T01:18:57Z"
        },
        {
            "id": "4843de62e910869ee34065ffe4c20137",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T23:11:42Z",
            "completed": true,
            "home_team": "Dallas Mavericks",
            "away_team": "Atlanta Hawks",
            "scores": [
                {
                    "name": "Dallas Mavericks",
                    "score": "103"
                },
                {
                    "name": "Atlanta Hawks",
                    "score": "94"
                }
            ],
            "last_update": "2022-02-07T01:26:29Z"
        },
        {
            "id": "e0f6669de3ae5af63162c3d9459184bf",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-06T23:12:42Z",
            "completed": true,
            "home_team": "Cleveland Cavaliers",
            "away_team": "Indiana Pacers",
            "scores": [
                {
                    "name": "Cleveland Cavaliers",
                    "score": "98"
                },
                {
                    "name": "Indiana Pacers",
                    "score": "85"
                }
            ],
            "last_update": "2022-02-07T01:36:15Z"
        },
        {
            "id": "a306576b1789dd1c884cc1aa61fda4bf",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-07T00:11:03Z",
            "completed": true,
            "home_team": "Houston Rockets",
            "away_team": "New Orleans Pelicans",
            "scores": [
                {
                    "name": "Houston Rockets",
                    "score": "107"
                },
                {
                    "name": "New Orleans Pelicans",
                    "score": "120"
                }
            ],
            "last_update": "2022-02-07T02:25:17Z"
        },
        {
            "id": "4b25562aa9e87b57aa16f970abaec8cc",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-07T02:11:01Z",
            "completed": false,
            "home_team": "Los Angeles Clippers",
            "away_team": "Milwaukee Bucks",
            "scores": [
                {
                    "name": "Los Angeles Clippers",
                    "score": "40"
                },
                {
                    "name": "Milwaukee Bucks",
                    "score": "37"
                }
            ],
            "last_update": "2022-02-07T02:47:23Z"
        },
        {
            "id": "19434a586e3723c55cd3d028b90eb112",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-08T00:10:00Z",
            "completed": false,
            "home_team": "Charlotte Hornets",
            "away_team": "Toronto Raptors",
            "scores": null,
            "last_update": null
        },
        {
            "id": "444e56cbf5a6d534741bb8d1298e2d50",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-08T01:10:00Z",
            "completed": false,
            "home_team": "Oklahoma City Thunder",
            "away_team": "Golden State Warriors",
            "scores": null,
            "last_update": null
        },
        {
            "id": "16d461b95e9d643d7f2469f72c098a20",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2022-02-08T02:10:00Z",
            "completed": false,
            "home_team": "Utah Jazz",
            "away_team": "New York Knicks",
            "scores": null,
            "last_update": null
        }
    ]

  

Tip

The game `id` field in the scores response matches the game `id` field in the odds response

### [#](#response-headers-3) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-3) Usage Quota Costs

The usage quota cost is 2 if the `daysFrom` parameter is specified (returning completed events), otherwise the usage quota cost is 1.

**Examples**

*   **Return live and upcoming games, and games completed within the last 3 days**
    
    Only live and completed games will have scores  
    Cost: 2  
    Example `/v4/sports/americanfootball_nfl/scores?daysFrom=3&apiKey=...`
    
*   **Return live and upcoming games**
    
    Only live games will have scores  
    Cost: 1  
    Example `/v4/sports/americanfootball_nfl/scores?apiKey=...`
    

  

Keeping track of quota usage

To keep track of usage credits, every API call includes the following response headers:

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

  
  
  

[#](#get-events) GET events
---------------------------

Returns a list of in-play and pre-match events for a specified sport or league. The response includes event id, home and away teams, and the commence time for each event. Odds are not included in the response. This endpoint does not count against the usage quota.

### [#](#endpoint-4) Endpoint

**GET** /v4/sports/{sport}/events?apiKey={apiKey}

### [#](#parameters-4) Parameters

*   **sport**   The sport key obtained from calling the /sports endpoint
    
*   **apiKey**   The API key associated with your subscription. [See usage plans](/#get-access)
    
*   **dateFormat**   Optional - Determines the format of timestamps in the response. Valid values are `unix` and `iso` (ISO 8601). Defaults to `iso`.
    
*   **eventIds**   Optional - Comma-separated game ids. Filters the response to only return games with the specified ids.
    
*   **commenceTimeFrom**   Optional - filter the response to show games that commence on and after this parameter. Values are in ISO 8601 format, for example 2023-09-09T00:00:00Z. This parameter has no effect if the sport is set to 'upcoming'.
    
*   **commenceTimeTo**   Optional - filter the response to show games that commence on and before this parameter. Values are in ISO 8601 format, for example 2023-09-10T23:59:59Z. This parameter has no effect if the sport is set to 'upcoming'.
    

### [#](#schema-4) Schema

For the detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/current%20events/get_v4_sports__sport__events)

### [#](#example-request-4) Example Request

**GET** [https://api.the-odds-api.com/v4/sports/americanfootball\_nfl/events?apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events?apiKey=YOUR_API_KEY)

### [#](#example-response-4) Example Response

    [
        {
          "id": "a512a48a58c4329048174217b2cc7ce0",
          "sport_key": "americanfootball_nfl",
          "sport_title": "NFL",
          "commence_time": "2023-01-01T18:00:00Z",
          "home_team": "Atlanta Falcons",
          "away_team": "Arizona Cardinals"
        },
        {
          "id": "0ba747b1414a31b05ef37f0bf3d7fbe9",
          "sport_key": "americanfootball_nfl",
          "sport_title": "NFL",
          "commence_time": "2023-01-01T18:00:00Z",
          "home_team": "Tampa Bay Buccaneers",
          "away_team": "Carolina Panthers"
        },
        {
          "id": "d7120d8231032db343cb86b20cfaaf48",
          "sport_key": "americanfootball_nfl",
          "sport_title": "NFL",
          "commence_time": "2023-01-01T18:00:00Z",
          "home_team": "Detroit Lions",
          "away_team": "Chicago Bears"
        },
        {
          "id": "c7e2faa6faf714fbe08621a727604cd8",
          "sport_key": "americanfootball_nfl",
          "sport_title": "NFL",
          "commence_time": "2023-01-01T18:00:00Z",
          "home_team": "Washington Commanders",
          "away_team": "Cleveland Browns"
        },
        {
          "id": "2ed3fd0d267bbae31360e9f19d5adbab",
          "sport_key": "americanfootball_nfl",
          "sport_title": "NFL",
          "commence_time": "2023-01-01T18:00:00Z",
          "home_team": "Kansas City Chiefs",
          "away_team": "Denver Broncos"
        },
        ...

### [#](#response-headers-4) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-4) Usage Quota Costs

This endpoint does not count against the usage quota.

  

[#](#get-event-odds) GET event odds
-----------------------------------

Returns odds for a single event. Accepts [any available betting markets](/sports-odds-data/betting-markets.html) using the `markets` parameter. Coverage of non-featured markets is currently limited to selected bookmakers and sports, and expanding over time.

**When to use this endpoint**: Use this endpoint to access odds for any supported market. Since the volume of data returned can be large, these requests will only query one event at a time. If you are only interested in the most popular betting markets, including head-to-head (moneyline), point spreads (handicap), over/under (totals), the main [/odds endpoint](#get-odds) is simpler to integrate and more cost-effective.

### [#](#endpoint-5) Endpoint

**GET** /v4/sports/{sport}/events/{eventId}/odds?apiKey={apiKey}&regions={regions}&markets={markets}&dateFormat={dateFormat}&oddsFormat={oddsFormat}

### [#](#parameters-5) Parameters

Parameters are the same as for the [/odds endpoint](#get-odds) with the addition of the `eventId` in the path. [All available market keys](/sports-odds-data/betting-markets.html) are accepted in the markets parameter.

*   **eventId**   The id of an upcoming or live game. Event ids can be found in the "id" field in the response of the [events endpoint](#get-events).

### [#](#schema-5) Schema

For the detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/current%20events/get_v4_sports__sport__events__eventId__odds)

### [#](#example-request-5) Example Request

**GET** [https://api.the-odds-api.com/v4/sports/americanfootball\_nfl/events/a512a48a58c4329048174217b2cc7ce0/odds?apiKey=YOUR\_API\_KEY&regions=us&markets=player\_pass\_tds&oddsFormat=american (opens new window)](https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/a512a48a58c4329048174217b2cc7ce0/odds?apiKey=YOUR_API_KEY&regions=us&markets=player_pass_tds&oddsFormat=american)

### [#](#example-response-5) Example Response

The response schema is almost the same as that of the [/odds endpoint](#get-odds) with a few differces:

*   A single game is returned, determined by the `eventId` parameter.
*   The `last_update` field is only available on the market level in the response and not on the bookmaker level. This reflects the fact that markets can update on their own schedule.
*   Relevant markets will have a `description` field in their outcomes.

    {
        "id": "a512a48a58c4329048174217b2cc7ce0",
        "sport_key": "americanfootball_nfl",
        "sport_title": "NFL",
        "commence_time": "2023-01-01T18:00:00Z",
        "home_team": "Atlanta Falcons",
        "away_team": "Arizona Cardinals",
        "bookmakers": [
            {
                "key": "draftkings",
                "title": "DraftKings",
                "markets": [
                    {
                        "key": "player_pass_tds",
                        "last_update": "2023-01-01T05:31:29Z",
                        "outcomes": [
                            {
                                "name": "Over",
                                "description": "David Blough",
                                "price": -205,
                                "point": 0.5
                            },
                            {
                                "name": "Under",
                                "description": "David Blough",
                                "price": 150,
                                "point": 0.5
                            },
                            {
                                "name": "Over",
                                "description": "Desmond Ridder",
                                "price": -270,
                                "point": 0.5
                            },
                            {
                                "name": "Under",
                                "description": "Desmond Ridder",
                                "price": 195,
                                "point": 0.5
                            }
                        ]
                    }
                ]
            },
            {
                "key": "fanduel",
                "title": "FanDuel",
                "markets": [
                    {
                        "key": "player_pass_tds",
                        "last_update": "2023-01-01T05:35:06Z",
                        "outcomes": [
                            {
                                "name": "Over",
                                "description": "David Blough",
                                "price": -215,
                                "point": 0.5
                            },
                            {
                                "name": "Under",
                                "description": "David Blough",
                                "price": 164,
                                "point": 0.5
                            },
                            {
                                "name": "Over",
                                "description": "Desmond Ridder",
                                "price": 196,
                                "point": 1.5
                            },
                            {
                                "name": "Under",
                                "description": "Desmond Ridder",
                                "price": -260,
                                "point": 1.5
                            }
                        ]
                    }
                ]
            }
        ]
    }

### [#](#response-headers-5) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-5) Usage Quota Costs

The usage quota cost depends on the number of markets and regions used in the request.

    cost = [number of unique markets returned] x [number of regions specified]
    

  

**Examples of usage quota costs**

*   **1 market, 1 region**  
    Cost: 1  
    Example `/v4/sports/americanfootball_nfl/events/a512a48a58c4329048174217b2cc7ce0/odds?markets=h2h&regions=us&...`
    
*   **3 markets, 1 region**  
    Cost: 3  
    Example `/v4/sports/americanfootball_nfl/events/a512a48a58c4329048174217b2cc7ce0/odds?markets=h2h,spreads,totals&regions=us&...`
    
*   **1 market, 3 regions**  
    Cost: 3  
    Example `/v4/sports/soccer_epl/events/037d7b6bb128546961e2a06680f63944/odds?markets=h2h&regions=us,uk,eu&...`
    
*   **3 markets, 3 regions**  
    Cost: 9  
    Example: `/v4/sports/basketball_nba/events/0b83beff5f82f8623eea93dbc1d7cd4e/odds?markets=h2h,spreads,totals&regions=us,uk,au&...`
    

  

Keeping track of quota usage

To keep track of usage credits, every API response includes the following response headers:

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#more-info-2) More info

*   Responses with empty data do not count towards the usage quota.
*   When calculating the market component of usage quota costs, a count of unique markets in the API response is used. For example if you specify 5 different markets and 1 region in the API call, and data is only available for 2 markets, the cost will be \[2 markets\] x \[1 region\] = 2

  
  

[#](#get-participants) GET participants
---------------------------------------

Returns list of participants for a given sport. Depending on the sport, a participant can be either a team or an individual. For example for NBA, a list of teams is returned. For tennis, a list of players is returned.

This endpoint does not return players on a team.

The returned list should be treated as a whitelist and may include participants that are not currently active.

### [#](#endpoint-6) Endpoint

**GET** /v4/sports/{sport}/participants?apiKey={apiKey}

### [#](#parameters-6) Parameters

*   **sport**   The sport key obtained from calling the /sports endpoint
    
*   **apiKey**   The API key associated with your subscription. [See usage plans](/#get-access)
    

### [#](#schema-6) Schema

For the detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/default/get_v4_sports__sport__participants)

### [#](#example-request-6) Example Request

**GET** [https://api.the-odds-api.com/v4/sports/americanfootball\_nfl/participants?apiKey=YOUR\_API\_KEY (opens new window)](https://api.the-odds-api.com/v4/sports/americanfootball_nfl/participants?apiKey=YOUR_API_KEY)

### [#](#example-response-6) Example Response

    [
        {
            "full_name": "Arizona Cardinals",
            "id": "par_01hqmkr1xsfxmrj5pdq0f23asx"
        },
        {
            "full_name": "Atlanta Falcons",
            "id": "par_01hqmkr1xtexkbhkq7ct921rne"
        },
        {
            "full_name": "Baltimore Ravens",
            "id": "par_01hqmkr1xvev9rf557fy09k2cx"
        },
        {
            "full_name": "Buffalo Bills",
            "id": "par_01hqmkr1xwe6prjwr3j4gpqwx8"
        },
        {
            "full_name": "Carolina Panthers",
            "id": "par_01hqmkr1xxf2ebbqzb95qzxxxm"
        },
        {
            "full_name": "Chicago Bears",
            "id": "par_01hqmkr1xye20ahvp8fr2bvt74"
        },
        {
            "full_name": "Cincinnati Bengals",
            "id": "par_01hqmkr1xze7xbceshy9tka512"
        },
        {
            "full_name": "Cleveland Browns",
            "id": "par_01hqmkr1y0ez5bem3gdncd8a0d"
        },
        {
            "full_name": "Dallas Cowboys",
            "id": "par_01hqmkr1y1esas88pmaxe87by4"
        },
        {
            "full_name": "Denver Broncos",
            "id": "par_01hqmkr1y2e15tjsz9afcsj7da"
        },
        {
            "full_name": "Detroit Lions",
            "id": "par_01hqmkr1y3fex9sq94dgg1107y"
        },
        {
            "full_name": "Green Bay Packers",
            "id": "par_01hqmkr1y4ez38hyananses4hq"
        },
        {
            "full_name": "Houston Texans",
            "id": "par_01hqmkr1y5f63reha26n71p2jx"
        },
        {
            "full_name": "Indianapolis Colts",
            "id": "par_01hqmkr1y6f10rxbf8y2y2xthh"
        },
        {
            "full_name": "Jacksonville Jaguars",
            "id": "par_01hqmkr1y7e2r9kcn2qe0dt1d5"
        },
        {
            "full_name": "Kansas City Chiefs",
            "id": "par_01hqmkr1y8e9gt2q2rhmv196pv"
        },
        {
            "full_name": "Las Vegas Raiders",
            "id": "par_01hqmkr1y9fkaaeekn9w035jft"
        },
        {
            "full_name": "Los Angeles Chargers",
            "id": "par_01hqmkr1yafvas6wtv3jfs9f7a"
        },
        {
            "full_name": "Los Angeles Rams",
            "id": "par_01hqmkr1ybfmfb8mhz10drfe21"
        },
        {
            "full_name": "Miami Dolphins",
            "id": "par_01hqmkr1ycf7dsbr1997gz03y9"
        },
        {
            "full_name": "Minnesota Vikings",
            "id": "par_01hqmkr1ydf6vrfmd5f07caj88"
        },
        {
            "full_name": "New England Patriots",
            "id": "par_01hqmkr1yeffz9y9spwv8bx3na"
        },
        {
            "full_name": "New Orleans Saints",
            "id": "par_01hqmkr1yfe62tp0rvy8bn2jyc"
        },
        {
            "full_name": "New York Giants",
            "id": "par_01hqmkr1ygfzrv5sqe2v97c43e"
        },
        {
            "full_name": "New York Jets",
            "id": "par_01hqmkr1yhe4sb3y0wfzga67tf"
        },
        {
            "full_name": "Philadelphia Eagles",
            "id": "par_01hqmkr1yjedgakx37g743855e"
        },
        {
            "full_name": "Pittsburgh Steelers",
            "id": "par_01hqmkr1yker5bwcznt0b1jpj1"
        },
        {
            "full_name": "San Francisco 49ers",
            "id": "par_01hqmkr1ymfv0a8kfg96ha10ag"
        },
        {
            "full_name": "Seattle Seahawks",
            "id": "par_01hqmkr1ynfwaa91y9zvagkavd"
        },
        {
            "full_name": "Tampa Bay Buccaneers",
            "id": "par_01hqmkr1ypeszan8sq8dh7rqbg"
        },
        {
            "full_name": "Tennessee Titans",
            "id": "par_01hqmkr1yqexebpc06vyfwxqqm"
        },
        {
            "full_name": "Washington Commanders",
            "id": "par_01hqmkr1yrfsvbjjasn01a7xz4"
        }
    ]

### [#](#response-headers-6) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-6) Usage Quota Costs

A call to this endpoint costs 1 usage credit.

[#](#get-historical-odds) GET historical odds
---------------------------------------------

Returns a snapshot of games with bookmaker odds for a given sport, region and market, at a given historical timestamp. Historical odds data is available from June 6th 2020, with snapshots taken at 10 minute intervals. From September 2022, historical odds snapshots are available at 5 minute intervals. This endpoint is only available on paid usage plans.

### [#](#endpoint-7) Endpoint

**GET** /v4/historical/sports/{sport}/odds?apiKey={apiKey}&regions={regions}&markets={markets}&date={date}

### [#](#parameters-7) Parameters

Parameters are the same as for the [/odds endpoint](#get-odds), with the addition of the `date` parameter.

*   **date**   The timestamp of the data snapshot to be returned, specified in ISO8601 format, for example `2021-10-18T12:00:00Z` The historical odds API will return the closest snapshot equal to or earlier than the provided `date` parameter.

### [#](#schema-7) Schema

For a detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/historical%20events/get_v4_historical_sports__sport__odds)

### [#](#example-request-7) Example Request

**GET** [https://api.the-odds-api.com/v4/historical/sports/americanfootball\_nfl/odds/?apiKey=YOUR\_API\_KEY&regions=us&markets=h2h&oddsFormat=american&date=2021-10-18T12:00:00Z (opens new window)](https://api.the-odds-api.com/v4/historical/sports/americanfootball_nfl/odds/?apiKey=YOUR_API_KEY&regions=us&markets=h2h&oddsFormat=american&date=2021-10-18T12:00:00Z)

### [#](#example-response-7) Example Response

The response schema is the same as that of the [/odds endpoint](#get-odds), but wrapped in a structure that contains information about the snapshot, including:

*   timestamp: The timestamp of the snapshot. This will be the closest available timestamp equal to or earlier than the provided `date` parameter.
*   previous\_timestamp: the preceding available timestamp. This can be used as the `date` parameter in a new request to move back in time.
*   next\_timestamp: The next available timestamp. This can be used as the `date` parameter in a new request to move forward in time.

[More sample responses for selected sports](/historical-odds-data/#sample-historical-odds-data)

    {
        "timestamp": "2021-10-18T11:55:00Z",
        "previous_timestamp": "2021-10-18T11:45:00Z",
        "next_timestamp": "2021-10-18T12:05:00Z",
        "data": [
            {
                "id": "4edd5ce090a3ec6192053b10d27b87b0",
                "sport_key": "americanfootball_nfl",
                "sport_title": "NFL",
                "commence_time": "2021-10-19T00:15:00Z",
                "home_team": "Tennessee Titans",
                "away_team": "Buffalo Bills",
                "bookmakers": [
                    {
                        "key": "draftkings",
                        "title": "DraftKings",
                        "last_update": "2021-10-18T11:48:09Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -294
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 230
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "twinspires",
                        "title": "TwinSpires",
                        "last_update": "2021-10-18T11:48:00Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -278
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 220
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "betfair",
                        "title": "Betfair",
                        "last_update": "2021-10-18T11:48:25Z",
                        "markets": [
                            {
                                "key": "h2h_lay",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -233
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 240
                                    }
                                ]
                            },
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -238
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 230
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "sugarhouse",
                        "title": "SugarHouse",
                        "last_update": "2021-10-18T11:48:27Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -263
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 228
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "betrivers",
                        "title": "BetRivers",
                        "last_update": "2021-10-18T11:45:46Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -263
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 228
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "barstool",
                        "title": "Barstool Sportsbook",
                        "last_update": "2021-10-18T11:48:21Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -278
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 220
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "fanduel",
                        "title": "FanDuel",
                        "last_update": "2021-10-18T11:47:58Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -270
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 220
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "betmgm",
                        "title": "BetMGM",
                        "last_update": "2021-10-18T11:44:23Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -250
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 210
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "unibet",
                        "title": "Unibet",
                        "last_update": "2021-10-18T11:49:57Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -263
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 225
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "williamhill_us",
                        "title": "William Hill (US)",
                        "last_update": "2021-10-18T11:48:21Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -270
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 220
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "betonlineag",
                        "title": "BetOnline.ag",
                        "last_update": "2021-10-18T11:48:28Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -256
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 215
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "key": "pointsbetus",
                        "title": "PointsBet (US)",
                        "last_update": "2021-10-18T11:48:46Z",
                        "markets": [
                            {
                                "key": "h2h",
                                "outcomes": [
                                    {
                                        "name": "Buffalo Bills",
                                        "price": -263
                                    },
                                    {
                                        "name": "Tennessee Titans",
                                        "price": 210
                                    }
                                ]
                            }
                        ]
                    },
     ...

### [#](#response-headers-7) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-7) Usage Quota Costs

The usage quota cost for historical odds is 10 per region per market.

    cost = 10 x [number of markets specified] x [number of regions specified]
    

  

**Examples of usage quota costs for historical odds**

*   **1 market, 1 region**  
    Cost: 10  
    Example `/v4/historical/sports/americanfootball_nfl/odds?markets=h2h&regions=us&...`
    
*   **3 markets, 1 region**  
    Cost: 30  
    Example `/v4/historical/sports/americanfootball_nfl/odds?markets=h2h,spreads,totals&regions=us&...`
    
*   **1 market, 3 regions**  
    Cost: 30  
    Example `/v4/historical/sports/soccer_epl/odds?markets=h2h&regions=us,uk,eu&...`
    
*   **3 markets, 3 regions**  
    Cost: 90  
    Example: `/v4/historical/sports/basketball_nba/odds?markets=h2h,spreads,totals&regions=us,uk,au&...`
    

  

Keeping track of quota usage

To keep track of usage credits, every API response includes the following response headers:

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#more-info-3) More info

*   Responses with empty data do not count towards the usage quota.
*   Prior to Septemer 18th 2022, only decimal odds were caputred in historical snapshots. American odds before this time are calculated from decimal odds and may include small rounding errors.
*   Data errors aren't common but they can occur from time to time. We are usually quick to correct errors in the current odds API, however they can still be present in historical odds snapshots. In future we plan to remove known errors from historical snapshots.
*   Bookmakers, sports and markets will only be available in the historical odds API from the time that they were added to the current odds API.

  
  

[#](#get-historical-events) GET historical events
-------------------------------------------------

Returns a list of historical events at a specified timestamp for a given sport. The response includes event id, home and away teams, and the commence time for each event. Odds are not included in the response. This endpoint can be used to find historical event ids to be used in the [historical event odds endpoint](#get-historical-event-odds). This endpoint is only available on paid usage plans.

### [#](#endpoint-8) Endpoint

**GET** /v4/historical/sports/{sport}/events?apiKey={apiKey}&date={date}

### [#](#parameters-8) Parameters

*   **sport**   The sport key obtained from calling the /sports endpoint
    
*   **apiKey**   The API key associated with your subscription. [See usage plans](/#get-access)
    
*   **date**   The timestamp of the data snapshot to be returned, specified in ISO8601 format, for example `2021-10-18T12:00:00Z` The historical odds API will return the closest snapshot equal to or earlier than the provided `date` parameter.
    
*   **dateFormat**   Optional - Determines the format of timestamps in the response. Valid values are `unix` and `iso` (ISO 8601). Defaults to `iso`.
    
*   **eventIds**   Optional - Comma-separated game ids. Filters the response to only return games with the specified ids.
    
*   **commenceTimeFrom**   Optional - filter the response to show games that commence on and after this parameter. Values are in ISO 8601 format, for example 2023-09-09T00:00:00Z. This parameter has no effect if the sport is set to 'upcoming'.
    
*   **commenceTimeTo**   Optional - filter the response to show games that commence on and before this parameter. Values are in ISO 8601 format, for example 2023-09-10T23:59:59Z. This parameter has no effect if the sport is set to 'upcoming'.
    

### [#](#schema-8) Schema

For the detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/historical%20events/get_v4_historical_sports__sport__events)

### [#](#example-request-8) Example Request

**GET** [https://api.the-odds-api.com/v4/historical/sports/basketball\_nba/events?apiKey=YOUR\_API\_KEY&date=2023-11-29T22:42:00Z (opens new window)](https://api.the-odds-api.com/v4/historical/sports/basketball_nba/events?apiKey=YOUR_API_KEY&date=2023-11-29T22:42:00Z)

### [#](#example-response-8) Example Response

The response schema is almost the same as that of the [/events endpoint](#get-events), but wrapped in a structure that contains information about the snapshot, including:

*   timestamp: The timestamp of the snapshot. This will be the closest available timestamp equal to or earlier than the provided date parameter.
*   previous\_timestamp: the preceding available timestamp. This can be used as the date parameter in a new request to move back in time.
*   next\_timestamp: The next available timestamp. This can be used as the date parameter in a new request to move forward in time.

    {
        "timestamp": "2023-11-29T22:40:39Z",
        "previous_timestamp": "2023-11-29T22:35:39Z",
        "next_timestamp": "2023-11-29T22:45:40Z",
        "data": [
            {
                "id": "da359da99aa27e97d38f2df709343998",
                "sport_key": "basketball_nba",
                "sport_title": "NBA",
                "commence_time": "2023-11-30T00:10:00Z",
                "home_team": "Detroit Pistons",
                "away_team": "Los Angeles Lakers"
            },
            {
                "id": "0a502b246aa29f8ac2edb7a3ddf71ae9",
                "sport_key": "basketball_nba",
                "sport_title": "NBA",
                "commence_time": "2023-11-30T00:10:00Z",
                "home_team": "Orlando Magic",
                "away_team": "Washington Wizards"
            },
            {
                "id": "2667f897a67e6cdad61bd26a3b941d83",
                "sport_key": "basketball_nba",
                "sport_title": "NBA",
                "commence_time": "2023-11-30T00:40:00Z",
                "home_team": "Toronto Raptors",
                "away_team": "Phoenix Suns"
            },
            ...

### [#](#response-headers-8) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-8) Usage Quota Costs

This endpoint costs 1 from usage quota. If no events are found, it will not cost.

  

[#](#get-historical-event-odds) GET historical event odds
---------------------------------------------------------

Returns historical odds for a single event as they appeared at a specified timestamp. Accepts [any available betting markets](/sports-odds-data/betting-markets.html) using the `markets` parameter. Historical data for additional markets (player props, alternate lines, period markets) are available after 2023-05-03T05:30:00Z. This endpoint is only available on paid usage plans.

Tip

When querying historical odds for [featured markets](/sports-odds-data/betting-markets.html#featured-betting-markets), the [historical odds endpoint](#get-historical-odds) is simpler to implement and more cost-effective.

### [#](#endpoint-9) Endpoint

**GET** /v4/historical/sports/{sport}/events/{eventId}/odds?apiKey={apiKey}&regions={regions}&markets={markets}&dateFormat={dateFormat}&oddsFormat={oddsFormat}&date={date}

### [#](#parameters-9) Parameters

Parameters are the same as for the [/odds endpoint](#get-odds) with the additions of the `eventId` in the path, and the `date` query parameter. [All available market keys](/sports-odds-data/betting-markets.html) are accepted in the markets parameter.

*   **eventId**   The id of a historical game. Historical event ids can be found in the "id" field in the response of the [historical events endpoint](#get-historical-events).
    
*   **date**   The timestamp of the data snapshot to be returned, specified in ISO8601 format, for example `2023-11-29T22:42:00Z` The historical odds API will return the closest snapshot equal to or earlier than the provided `date` parameter. Historical data for additional markets are available after 2023-05-03T05:30:00Z. Snapshots are available at 5 minute intervals.
    

### [#](#schema-9) Schema

For the detailed API spec, see the [Swagger API docs (opens new window)](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4#/historical%20events/get_v4_historical_sports__sport__events__eventId__odds)

### [#](#example-request-9) Example Request

**GET** [https://api.the-odds-api.com/v4/historical/sports/basketball\_nba/events/da359da99aa27e97d38f2df709343998/odds?apiKey=YOUR\_API\_KEY&date=2023-11-29T22:45:00Z&regions=us&markets=player\_points,h2h\_q1 (opens new window)](https://api.the-odds-api.com/v4/historical/sports/basketball_nba/events/da359da99aa27e97d38f2df709343998/odds?apiKey=YOUR_API_KEY&date=2023-11-29T22:45:00Z&regions=us&markets=player_points,h2h_q1)

### [#](#example-response-9) Example Response

The response schema is almost the same as that of the [/event odds endpoint](#get-event-odds), but wrapped in a structure that contains information about the snapshot, including:

*   timestamp: The timestamp of the snapshot. This will be the closest available timestamp equal to or earlier than the provided date parameter.
*   previous\_timestamp: the preceding available timestamp. This can be used as the date parameter in a new request to move back in time.
*   next\_timestamp: The next available timestamp. This can be used as the date parameter in a new request to move forward in time.

    {
        "timestamp": "2023-11-29T22:40:39Z",
        "previous_timestamp": "2023-11-29T22:35:39Z",
        "next_timestamp": "2023-11-29T22:45:40Z",
        "data": {
            "id": "da359da99aa27e97d38f2df709343998",
            "sport_key": "basketball_nba",
            "sport_title": "NBA",
            "commence_time": "2023-11-30T00:10:00Z",
            "home_team": "Detroit Pistons",
            "away_team": "Los Angeles Lakers",
            "bookmakers": [
                {
                    "key": "draftkings",
                    "title": "DraftKings",
                    "last_update": "2023-11-29T22:40:09Z",
                    "markets": [
                        {
                            "key": "h2h_q1",
                            "last_update": "2023-11-29T22:40:55Z",
                            "outcomes": [
                                {
                                    "name": "Detroit Pistons",
                                    "price": 2.5
                                },
                                {
                                    "name": "Los Angeles Lakers",
                                    "price": 1.56
                                }
                            ]
                        },
                        {
                            "key": "player_points",
                            "last_update": "2023-11-29T22:40:55Z",
                            "outcomes": [
                                {
                                    "name": "Over",
                                    "description": "Anthony Davis",
                                    "price": 1.83,
                                    "point": 23.5
                                },
                                {
                                    "name": "Under",
                                    "description": "Anthony Davis",
                                    "price": 1.91,
                                    "point": 23.5
                                },
                                {
                                    "name": "Over",
                                    "description": "Ausar Thompson",
                                    "price": 1.87,
                                    "point": 11.5
                                },
                                {
                                    "name": "Under",
                                    "description": "Ausar Thompson",
                                    "price": 1.87,
                                    "point": 11.5
                                },
                                {
                                    "name": "Over",
                                    "description": "Cade Cunningham",
                                    "price": 1.91,
                                    "point": 23.5
                                },
                                {
                                    "name": "Under",
                                    "description": "Cade Cunningham",
                                    "price": 1.83,
                                    "point": 23.5
                                },
                                {
                                    "name": "Over",
                                    "description": "D'Angelo Russell",
                                    "price": 1.87,
                                    "point": 14.5
                                },
                                ...

### [#](#response-headers-9) Response Headers

The following response headers are returned

*   **x-requests-remaining**   The usage credits remaining until the quota resets
*   **x-requests-used**   The usage credits used since the last quota reset
*   **x-requests-last**   The usage cost of the last API call

### [#](#usage-quota-costs-9) Usage Quota Costs

The usage quota cost depends on the number of markets and regions used in the request.

    cost = 10 x [number of unique markets returned] x [number of regions specified]
    

  

**Examples of usage quota costs**

*   **1 market, 1 region**  
    Cost: 10  
    Example `/v4/historical/sports/americanfootball_nfl/events/a512a48a58c4329048174217b2cc7ce0/odds?markets=player_pass_tds&regions=us&...`
    
*   **3 markets, 1 region**  
    Cost: 30  
    Example `/v4/historical/sports/americanfootball_nfl/events/a512a48a58c4329048174217b2cc7ce0/odds?markets=player_pass_tds,player_anytime_td,player_rush_longest&regions=us&...`
    
*   **1 market, 3 regions**  
    Cost: 30  
    Example `/v4/historical/sports/basketball_nba/events/037d7b6bb128546961e2a06680f63944/odds?markets=player_points&regions=us,us2,au&...`
    
*   **3 markets, 3 regions**  
    Cost: 90  
    Example: `/v4/historical/sports/basketball_nba/events/0b83beff5f82f8623eea93dbc1d7cd4e/odds?markets=player_points,player_assists,alternate_spreads&regions=us,us2,au&...`
    

  

Keeping track of quota usage

To keep track of usage credits, every API response includes the following response headers:

*   x-requests-used
*   x-requests-remaining
*   x-requests-last

### [#](#more-info-4) More info

*   Responses with empty data do not count towards the usage quota.
*   When calculating the market component of usage quota costs, a count of unique markets in the API response is used. For example if you specify 5 different markets and 1 region in the API call, and data is only available for 2 markets, the cost will be 10 x \[2 markets\] x \[1 region\] = 20

  
  

[#](#rate-limiting-status-code-429) Rate Limiting (status code 429)
-------------------------------------------------------------------

Requests are rate limited in order to protect our systems from sudden bursts in traffic. If you enounter the rate limit, the API will respond with a status code of 429, in which case try spacing out requests over several seconds. More information can be [found here](/liveapi/guides/v4/api-error-codes.html#exceeded-freq-limit).

[#](#code-samples) Code Samples
-------------------------------

Get started right away with [code samples for Python and NodeJs](/liveapi/guides/v4/samples.html). Code samples are also available on [Github (opens new window)](https://github.com/the-odds-api)

[#](#more-info-5) More Info
---------------------------

Stay up to date on new sports, bookmakers and features by [following us on Twitter (opens new window)](https://twitter.com/The_Odds_API)

  
  

[X.com](https://twitter.com/The_Odds_API) • [Bluesky](https://bsky.app/profile/oddsapi.bsky.social) • [Github](https://github.com/the-odds-api)

[Status](https://status.the-odds-api.com/) • [Terms](/terms-and-conditions.html) • [Privacy Policy](/privacy.html) • [Contact](mailto:team@the-odds-api.com)

© 2025 The Odds API