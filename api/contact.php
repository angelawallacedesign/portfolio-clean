<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Please submit the contact form.']);
}
// JSON-only requests and same-origin validation prevent cross-site form posts.
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    respond(415, ['error' => 'Unsupported request format.']);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && strtolower((string) parse_url($origin, PHP_URL_HOST)) !== strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0])) {
    respond(403, ['error' => 'Please use the contact form on this website.']);
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) respond(413, ['error' => 'Your message is too long.']);
$data = json_decode($raw, true);
if (!is_array($data)) respond(400, ['error' => 'Invalid request.']);
foreach (['name', 'email', 'comments', 'website'] as $field) {
    if (isset($data[$field]) && !is_string($data[$field])) respond(422, ['error' => 'Please check your form fields.']);
}
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$comments = trim($data['comments'] ?? '');
if (trim($data['website'] ?? '') !== '') respond(422, ['error' => 'Unable to submit this request.']);
if ($name === '' || strlen($name) > 400 || preg_match('/[\r\n\x00]/', $name) || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n\x00]/', $email) || $comments === '' || strlen($comments) > 20000) {
    respond(422, ['error' => 'Please enter your name, a valid email, and comments.']);
}
// Per-client throttle. Lock the record throughout delivery to prevent parallel abuse.
$rateFile = sys_get_temp_dir() . '/awd-contact-' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . __FILE__) . '.json';
$lock = fopen($rateFile, 'c+');
if (!$lock || !flock($lock, LOCK_EX)) respond(503, ['error' => 'Email is temporarily unavailable. Please try again later.']);
$record = json_decode(stream_get_contents($lock) ?: '[]', true);
$times = array_values(array_filter(is_array($record) ? $record : [], static function ($time) { return is_int($time) && $time > time() - 3600; }));
if (count($times) >= 5 || ($times && end($times) > time() - 30)) respond(429, ['error' => 'Please wait before sending another message.']);
$times[] = time();
ftruncate($lock, 0);
rewind($lock);
fwrite($lock, json_encode($times));
fflush($lock);
$recipient = 'hello@angelawallace.net';
$body = "Portfolio contact form\n\nName: {$name}\nEmail: {$email}\n\n{$comments}\n";
$headers = "From: Angela Wallace Portfolio <hello@angelawallace.net>\r\nReply-To: {$email}\r\nContent-Type: text/plain; charset=UTF-8\r\n";
$sent = function_exists('mail') && @mail($recipient, 'Portfolio website inquiry', $body, $headers);
flock($lock, LOCK_UN);
fclose($lock);
if (!$sent) respond(503, ['error' => 'Your email could not be sent. Please email hello@angelawallace.net directly.']);
respond(200, ['success' => true]);
