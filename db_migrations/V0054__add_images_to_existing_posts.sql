UPDATE t_p46588937_remont_plus_app.posts SET image_url = CASE id
  WHEN 1 THEN 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/fc8c9608-e4fa-4738-b27b-c10195c62fc6.jpg'
  WHEN 2 THEN 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/49e1f08d-2016-4daf-9067-61b73ad237d1.jpg'
  WHEN 3 THEN 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5ed6752a-0657-4e27-92a1-ce2016695dbd.jpg'
  WHEN 4 THEN 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5a1a4909-350b-4d72-afba-66439210ae86.jpg'
  WHEN 5 THEN 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/37faad9a-0935-481b-8a5f-8e58d1b9efe4.jpg'
  WHEN 6 THEN 'https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/3e0446aa-ca52-4887-b551-05e6432bd1b7.jpg'
END
WHERE id IN (1,2,3,4,5,6);