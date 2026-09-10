# Google Reviews Link

No verified Google Business Profile URL for World Foods Halal Market is present in this repository.

The "Find Us on Google" button on the homepage therefore points at a Google Maps search
built from the store's own verified name and address:

```
https://www.google.com/maps/search/?api=1&query=World+Foods+Halal+Market+6626+Penn+Ave+S+Richfield+MN+55423
```

That URL resolves to the business listing without hard-coding a place ID or short link that
has not been confirmed.

The surrounding copy deliberately does not promise that the link opens a dedicated reviews
page, because we cannot confirm what the listing shows.

When the owner supplies the profile's own review link (the `Ask for reviews` short link from
the Google Business Profile dashboard, usually in the form `https://g.page/r/.../review`),
replace the search URL in `index.html` with it and the button label can become a review call
to action at that point.

Do not add a rating value, a review count, or review quotes to any page unless they come from
the live listing at the time of the change. No `AggregateRating` or `Review` structured data is
present, and none should be added from estimated numbers.
