# Firebase Realtime Database 作為跨裝置同步的資料層

系統需要在多台裝置上即時同步藥品資料，但部署平台 GitHub Pages 是純靜態網站，無法自行儲存資料。我們選擇 Firebase Realtime Database 作為外部資料層，而非把資料寫回 GitHub repo（需要管理 token 且有延遲）或只存 localStorage（無法跨裝置）。Firebase 免費額度足夠個人使用，設定簡單，且原生支援即時監聽。

## Considered Options

- **GitHub API 寫回 repo**：資料存在 repo 的 JSON 檔，不需第三方服務，但需要在前端暴露有寫入權限的 token，有安全風險，且同步有延遲。
- **localStorage**：零設定，但資料鎖在單一裝置，不符合跨裝置需求。
