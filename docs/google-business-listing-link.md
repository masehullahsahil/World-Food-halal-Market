# Google Business Listing

## Verified details

| Field | Value |
|---|---|
| Business | World Foods Halal Market |
| Address | 6626 Penn Ave S, Richfield, MN 55423 |
| Google Place ID | `ChIJ41SgKgAn9ocRr2k5KAPY2K4` |

The site uses this Place ID so Google Maps resolves to this exact business rather than to a
text match on the name or street address.

## Where the Place ID is used

**Homepage "Find Us on Google" button** — opens the business listing:

```
https://www.google.com/maps/search/?api=1&query=World+Foods+Halal+Market&query_place_id=ChIJ41SgKgAn9ocRr2k5KAPY2K4
```

**Every "Get Directions" and "Directions" link across the site** — routes to the store, with the
address kept as the human-readable fallback and the Place ID pinning the destination:

```
https://www.google.com/maps/dir/?api=1&destination=6626+Penn+Ave+S+Richfield+MN+55423&destination_place_id=ChIJ41SgKgAn9ocRr2k5KAPY2K4
```

`destination_place_id` is only honoured when `destination` is also present, so both parameters
must stay together. The same pairing applies to `query` and `query_place_id`.

The two embedded map iframes still use the plain address query and were deliberately left alone.

## Not yet available: the review link

The owner's official "Ask for reviews" short link from the Google Business Profile dashboard
(usually in the form `https://g.page/r/.../review`) has not been supplied, so no review call to
action exists on the site. The homepage copy deliberately does not promise that the button opens
a dedicated reviews page.

When that link arrives, add it as its own call to action rather than repointing the "Find Us on
Google" button, which serves a different purpose.

## Never add from estimates

No rating value, review count, or review quote belongs on any page unless it comes from the live
listing at the time of the change. No `AggregateRating` or `Review` structured data is present,
and none should be added. There is no `FAQPage` structured data either, since Google discontinued
FAQ rich results.
