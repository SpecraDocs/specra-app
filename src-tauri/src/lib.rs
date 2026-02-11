mod archive;
mod auth;
mod deploy;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            auth::start_auth_server,
            archive::create_archive,
            deploy::deploy_project,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
