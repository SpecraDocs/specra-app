use flate2::write::GzEncoder;
use flate2::Compression;
use serde::Deserialize;
use std::io::Write;

#[derive(Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub content: String,
}

#[tauri::command]
pub fn create_archive(files: Vec<FileEntry>) -> Result<Vec<u8>, String> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());

    {
        let mut archive = tar::Builder::new(&mut encoder);

        for entry in &files {
            let data = entry.content.as_bytes();
            let mut header = tar::Header::new_gnu();
            header.set_size(data.len() as u64);
            header.set_mode(0o644);
            header.set_cksum();

            archive
                .append_data(&mut header, &entry.path, data)
                .map_err(|e| format!("Failed to add file {}: {}", entry.path, e))?;
        }

        archive
            .finish()
            .map_err(|e| format!("Failed to finalize archive: {}", e))?;
    }

    encoder
        .finish()
        .map_err(|e| format!("Failed to compress archive: {}", e))
}
