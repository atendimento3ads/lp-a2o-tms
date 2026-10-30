<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $success): never {
    http_response_code($status);
    echo json_encode(['success' => $success], JSON_THROW_ON_ERROR);
    exit;
}

function digits(string $value): string {
    return preg_replace('/\D/', '', $value) ?? '';
}

function valid_cnpj(string $input): bool {
    $number = digits($input);
    if (!preg_match('/^\d{14}$/', $number) || preg_match('/^(\d)\1{13}$/', $number)) return false;
    foreach ([12, 13] as $length) {
        $weights = $length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
        $sum = 0;
        foreach ($weights as $i => $weight) $sum += (int)$number[$i] * $weight;
        $rest = $sum % 11;
        if ((int)$number[$length] !== ($rest < 2 ? 0 : 11 - $rest)) return false;
    }
    return true;
}

function valid_phone(string $input): bool {
    $number = digits($input);
    if (!in_array(strlen($number), [10, 11], true)) return false;
    $ddds = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
    if (!in_array((int)substr($number, 0, 2), $ddds, true)) return false;
    $local = substr($number, 2);
    if (preg_match('/^(\d)\1+$/', $local) || in_array($local, ['12345678','123456789','98765432','987654321'], true)) return false;
    return strlen($number) === 11 ? $local[0] === '9' : (bool)preg_match('/^[2-5]/', $local);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(405, false);
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) respond(415, false);
$raw = file_get_contents('php://input', false, null, 0, 12001);
if ($raw === false || strlen($raw) > 12000) respond(413, false);
$lead = json_decode($raw, true);
if (!is_array($lead)) respond(400, false);

$required = ['nome','empresa','cnpj','whatsapp','desafio','origem_form','submission_id'];
foreach ($required as $key) if (!isset($lead[$key]) || !is_string($lead[$key])) respond(400, false);
foreach (['email','utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'] as $key) {
    if (!isset($lead[$key])) $lead[$key] = '';
    if (!is_string($lead[$key])) respond(400, false);
}
if (!preg_match('/^[a-f0-9-]{32,36}$/i', $lead['submission_id'])) respond(400, false);
if (!valid_cnpj($lead['cnpj']) || !valid_phone($lead['whatsapp'])) respond(422, false);
if (mb_strlen(trim($lead['nome'])) < 2 || mb_strlen($lead['nome']) > 120) respond(422, false);
if (mb_strlen(trim($lead['empresa'])) < 2 || mb_strlen($lead['empresa']) > 160) respond(422, false);
if ($lead['email'] !== '' && !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) respond(422, false);
if (strlen($lead['email']) > 180) respond(422, false);
if (!in_array($lead['desafio'], ['Operação/TMS','Frota','Fiscal','Financeiro','Integração entre áreas','Outro'], true)) respond(422, false);
if (!in_array($lead['origem_form'], ['topo','final'], true)) respond(422, false);
foreach (['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'] as $key) {
    if (strlen($lead[$key]) > 250) respond(422, false);
}

// O URL do Apps Script permanece fora da pasta pública e do Git.
$configPath = '/home2/hg3ads37/.config/a2o-tms-leads.php';
if (!is_file($configPath)) respond(503, false);
$config = require $configPath;
$url = $config['web_app_url'] ?? '';
if (!is_string($url) || !preg_match('~^https://script\.google\.com/macros/s/[^/]+/exec$~', $url)) respond(503, false);
if (!function_exists('curl_init')) respond(503, false);

$curl = curl_init($url);
if ($curl === false) respond(503, false);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($lead, JSON_THROW_ON_ERROR),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 10,
]);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);
if (!is_string($body) || $status !== 200) respond(502, false);
$result = json_decode($body, true);
if (!is_array($result) || ($result['success'] ?? null) !== true) respond(502, false);
respond(200, true);
