# Contact endpoint

Serve this site on a PHP 7.4+ host with PHP's `mail()` configured and outbound mail enabled.
`POST /api/contact.php` accepts JSON containing `name`, `email`, `comments`, and an empty
`website` honeypot. The recipient and sender are fixed to hello@angelawallace.net;
Reply-To is the validated visitor address. Configure your host's SPF/DKIM for delivery.

The UI shows confirmation only after `{ "success": true }`. This means the server
accepted the mail for delivery; it cannot guarantee inbox arrival. Static hosting
(including GitHub Pages and Python's HTTP server) cannot execute this endpoint.

Manual PHP checks: run `php -l api/contact.php`, then serve the repository with
`php -S 127.0.0.1:8080`. Confirm GET → 405, non-JSON POST → 415, invalid fields → 422,
foreign Origin → 403, and throttled submissions → 429. Test a real send only on a
mail-enabled host. No credentials or email addresses from visitors are logged.
