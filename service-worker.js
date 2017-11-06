const CACHE_KEY = 'demo';
const CACHE_FILES = [
    '/',
    'bg.jpg',
    'index.js',
    'index.css'
];


self.addEventListener('install', function(event) { // 监听worker的install事件
    event.waitUntil( // 延迟install事件直至Cache初始化完成
        caches.open(CACHE_KEY)
            .then(function(cache) {
                console.log('Cache created');
                return cache.addAll(CACHE_FILES);
            })
    );
});

self.addEventListener('activate', function(event) { // 监听worker的activate事件
    event.waitUntil( // 延迟activate事件直到Cache初始化完成
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(key, i) { // 清除旧版本缓存
                if (key !== CACHE_KEY) {
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});

self.addEventListener('fetch', function(event) { // 拦截资源请求
    event.respondWith( // 返回资源请求
        caches.match(event.request).then(function(res) { // 判断是否命中缓存
            if (res) {  // 返回缓存的资源
                return res;
            }
            fallback(event); // 执行请求备份操作
        })
    )
});

function fallback(event) {  // 恢复原始请求
    const url = event.request.clone();
    return fetch(url).then(function(res) { // 请求资源
        //if not a valid response send the error
        if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
        }

        const response = res.clone();

        caches.open(CACHE_KEY).then(function(cache) { // 缓存从刚刚下载的资源
            cache.put(event.request, response);
        });

        return res;
    })
}