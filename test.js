const test = async () => {
    console.log('START');
    try {
        console.log('Fetching JSdelivr...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/public/static/Pretendard-Regular.ttf', { signal: controller.signal });
        clearTimeout(timeout);
        console.log('JSdelivr OK');
    } catch(e) {
        console.error('JSdelivr error', e.message);
    }
    
    try {
        console.log('Fetching Cafe24...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch('http://yogibo.openhost.cafe24.com/web/vmd/10.png', { signal: controller.signal });
        clearTimeout(timeout);
        console.log('Cafe24 OK');
    } catch(e) {
        console.error('Cafe24 error', e.message);
    }
    console.log('END');
}
test();
