# Lighthouse evidence — the live site

Measured against **https://yastremskyi.com** through Cloudflare on 2026-08-20,
mobile profile. These replace the earlier localhost figures: a simulation against
a loopback server is not the same thing as the deployed site, and it turned out to
be pessimistic.

| route         | perf | a11y | best practices | SEO | FCP ms | LCP ms |   CLS | TTFB ms |
| ------------- | ---: | ---: | -------------: | --: | -----: | -----: | ----: | ------: |
| `/about`      |  100 |  100 |            100 | 100 |    814 |   1096 | 0.000 |      72 |
| `/cv`         |  100 |  100 |            100 | 100 |    818 |   1100 | 0.000 |      69 |
| `/groundwork` |  100 |  100 |            100 | 100 |    831 |   1105 | 0.000 |      64 |
| `/`           |   99 |  100 |            100 | 100 |   1097 |   1254 | 0.000 |      68 |
| `/work`       |  100 |  100 |            100 | 100 |    834 |   1116 | 0.000 |     102 |

The home-page LCP is the median of three runs; the rest are single runs.

## Against the brief's bars

- Performance ≥ 98 — **met**, 99 on the home page and 100 elsewhere.
- Accessibility, best practices, SEO all 100 — **met** on every route.
- CLS < 0.01 — **met**, 0.000 everywhere.
- **LCP < 1200 ms — met on 4 of 5 routes** (`/about`, `/cv`, `/groundwork`, `/work`),
  and missed on `/` by 54 ms.

That last line corrects an earlier claim in this repository. Measured against a
local preview, every route sat at 1202–1208 ms and the conclusion was that the bar
could not be met at all. Against the real deployment behind Cloudflare, four
routes come in at 1096–1116 ms. The home page is the outlier because it is the one
page carrying a photograph, which an A/B on the built HTML had already identified
as its largest contentful paint.

Getting `/` under the bar means removing the portrait from the first mobile
viewport. That is a trade — 54 ms against a face on the page a hiring manager
opens first — and it is Max's to make, not one to slip in for the sake of a
number.
