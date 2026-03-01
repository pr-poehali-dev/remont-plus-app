UPDATE t_p46588937_remont_plus_app.showroom_items
SET video_url = REPLACE(video_url, '/files/showroom/', '/bucket/showroom/')
WHERE video_url LIKE '%/files/showroom/%';