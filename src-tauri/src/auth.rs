use serde::Serialize;
use std::io::{BufRead, BufReader, Write};
use std::net::TcpListener;

#[derive(Serialize)]
pub struct AuthResult {
    pub token: String,
    pub state: String,
}

#[tauri::command]
pub async fn start_auth_server(port: u16, state: String) -> Result<AuthResult, String> {
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .map_err(|e| format!("Failed to bind to port {}: {}", port, e))?;

    // Accept one connection
    let (mut stream, _) = listener
        .accept()
        .map_err(|e| format!("Failed to accept connection: {}", e))?;

    let reader = BufReader::new(&stream);
    let request_line = reader
        .lines()
        .next()
        .ok_or("No request received")?
        .map_err(|e| format!("Failed to read request: {}", e))?;

    // Parse GET /?token=...&state=... HTTP/1.1
    let query = request_line
        .split_whitespace()
        .nth(1)
        .ok_or("Invalid request")?
        .split('?')
        .nth(1)
        .ok_or("No query params")?;

    let mut token_val = None;
    let mut state_val = None;

    for param in query.split('&') {
        let mut parts = param.splitn(2, '=');
        let key = parts.next().unwrap_or("");
        let value = parts.next().unwrap_or("");
        match key {
            "token" => token_val = Some(value.to_string()),
            "state" => state_val = Some(value.to_string()),
            _ => {}
        }
    }

    let received_token = token_val.ok_or("No token in callback")?;
    let received_state = state_val.ok_or("No state in callback")?;

    if received_state != state {
        let response = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/html\r\n\r\n<html><body><h1>Authentication failed</h1><p>State mismatch.</p></body></html>";
        let _ = stream.write_all(response.as_bytes());
        return Err("State mismatch".to_string());
    }

    let response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<html><body><h1>Authentication successful!</h1><p>You can close this tab and return to Specra.</p></body></html>";
    let _ = stream.write_all(response.as_bytes());

    Ok(AuthResult {
        token: received_token,
        state: received_state,
    })
}
