use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DeployResult {
    pub deployment_id: String,
}

#[tauri::command]
pub async fn deploy_project(
    api_url: String,
    project_id: String,
    token: String,
    archive_bytes: Vec<u8>,
) -> Result<DeployResult, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/projects/{}/deploy", api_url, project_id);

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/octet-stream")
        .header("X-Deploy-Trigger", "MANUAL")
        .body(archive_bytes)
        .send()
        .await
        .map_err(|e| format!("Deploy request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Deploy failed ({}): {}", status, body));
    }

    #[derive(Deserialize)]
    struct ApiResponse {
        #[serde(rename = "deploymentId")]
        deployment_id: String,
    }

    let api_response: ApiResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse deploy response: {}", e))?;

    Ok(DeployResult {
        deployment_id: api_response.deployment_id,
    })
}
