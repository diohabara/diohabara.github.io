import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexSource = () => readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const worldSource = () => readFile(new URL('../src/components/BlogWorld.astro', import.meta.url), 'utf8');
const homeModeSource = () => readFile(new URL('../src/components/HomeModeSwitcher.astro', import.meta.url), 'utf8');
const headerSource = () => readFile(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
const packageSource = () => readFile(new URL('../package.json', import.meta.url), 'utf8');

test('home page renders the mode switcher from published blog posts', async () => {
  const source = await indexSource();

  assert.match(source, /import HomeModeSwitcher from ['"]\.\.\/components\/HomeModeSwitcher\.astro['"]/);
  assert.match(source, /getCollection\(['"]blog['"]\)/);
  assert.match(source, /\.filter\(\(p\)\s*=>\s*!p\.data\.draft\)/);
  assert.match(source, /<Layout[^>]*homeModeSwitch/);
  assert.doesNotMatch(source, /hideSiteChrome/);
  assert.match(source, /<HomeModeSwitcher\s+posts=\{posts\}\s*\/>/);
  assert.doesNotMatch(source, /HomeRooms/);
});

test('home mode switcher offers 3D and ordinary blog modes', async () => {
  const source = await homeModeSource();

  assert.match(source, /import BlogWorld from ['"]\.\/BlogWorld\.astro['"]/);
  assert.match(source, /import PostCard from ['"]\.\/PostCard\.astro['"]/);
  assert.match(source, /import LanguageFilter from ['"]\.\/LanguageFilter\.astro['"]/);
  assert.match(source, /data-home-mode-switcher/);
  assert.match(source, /data-home-mode-button="world"/);
  assert.match(source, /data-home-mode-button="blog"/);
  assert.match(source, /data-home-mode-panel="world" data-pagefind-ignore/);
  assert.match(source, /data-home-mode-panel="blog"/);
  assert.match(source, /<BlogWorld\s+posts=\{posts\}\s*\/>/);
  assert.match(source, /<LanguageFilter\s+jCount=\{jaCount\}\s+enCount=\{enCount\}\s+totalCount=\{posts\.length\}\s*\/>/);
  assert.match(source, /<PostCard/);
  assert.doesNotMatch(source, /barabara-home-mode/);
  assert.match(source, /document\.documentElement\.dataset\.homeMode = mode/);
  assert.match(source, /home-mode-switcher--ready/);
  assert.match(source, /:global\(html\[data-home-mode-page='true'\]\[data-home-mode='world'\] \.site-header\)/);
  assert.match(source, /:global\(html\[data-home-mode-page='true'\]\[data-home-mode='world'\] \.site-footer\)/);
});

test('home mode switcher makes the ordinary blog route obvious', async () => {
  const source = await homeModeSource();

  assert.match(source, /MODE/);
  assert.match(source, /CITY/);
  assert.match(source, /BLOG/);
  assert.match(source, /aria-label="表示モードを切り替え"/);
  assert.match(source, /data-home-mode-button="blog"[\s\S]*BLOG/);
  assert.match(source, /:global\(html\[data-home-mode-page='true'\]\[data-home-mode='world'\]\) \.home-mode-toggle button\[data-home-mode-button='blog'\]/);
});

test('home mode switcher looks like an in-world cyberpunk mode terminal', async () => {
  const source = await homeModeSource();

  assert.match(source, /--mode-cyan:\s*#3df8ff/);
  assert.match(source, /--mode-magenta:\s*#ff2bd6/);
  assert.match(source, /clip-path:\s*polygon/);
  assert.match(source, /linear-gradient\(90deg, var\(--mode-cyan\), var\(--mode-magenta\)\)/);
  assert.match(source, /data-home-mode-button='world'/);
  assert.match(source, /data-home-mode-button='blog'/);
  assert.doesNotMatch(source, /普通のブログで読む/);
  assert.doesNotMatch(source, /3D入口/);
});

test('home mode switcher moves into the shared header while reading the blog list', async () => {
  const source = await homeModeSource();
  const header = await headerSource();

  assert.match(header, /data-home-mode-header-slot/);
  assert.match(header, /site-nav__home-mode-slot/);
  assert.match(source, /const headerSlot = document\.querySelector\('\[data-home-mode-header-slot\]'\)/);
  assert.match(source, /const originalToggleParent = toggle\?\.parentElement/);
  assert.match(source, /placeModeToggle\(mode\)/);
  assert.match(source, /mode === 'blog' && headerSlot instanceof HTMLElement/);
  assert.match(source, /headerSlot\.append\(toggle\)/);
  assert.match(source, /home-mode-toggle--in-header/);
  assert.match(source, /new CustomEvent\('home-mode-change', \{ detail: \{ mode \} \}\)/);
  assert.match(source, /\.home-mode-toggle--in-header\s*\{[\s\S]*display:\s*flex/);
  assert.match(source, /\.home-mode-toggle--in-header\s*\{[\s\S]*position:\s*static/);
  assert.match(source, /\.home-mode-toggle--in-header\s*\{[\s\S]*width:\s*auto/);
});

test('home mode switcher starts in 3D mode instead of restoring blog mode', async () => {
  const source = await homeModeSource();

  assert.match(source, /setMode\('world'\)/);
  assert.doesNotMatch(source, /localStorage\.getItem\('barabara-home-mode'\)/);
  assert.doesNotMatch(source, /localStorage\.setItem\('barabara-home-mode'/);
});

test('3D world uses Three.js and renders a canvas game surface', async () => {
  const source = await worldSource();
  const packageJson = JSON.parse(await packageSource());

  assert.equal(typeof packageJson.dependencies.three, 'string');
  assert.match(source, /from ['"]three['"]/);
  assert.match(source, /<canvas class="blog-world__canvas" data-world-canvas/);
  assert.match(source, /try\s*\{[\s\S]*new WebGLRenderer\(\{ canvas, antialias: true, preserveDrawingBuffer: true \}\)/);
  assert.match(source, /root\.classList\.add\('blog-world--ready'\)/);
  assert.match(source, /createArchiveBuilding\(post, index, layout\[index\]\)/);
  assert.match(source, /createPlayer\(\)/);
});

test('3D world has a distinctive cyberpunk archive city visual language', async () => {
  const source = await worldSource();

  assert.match(source, /createMemoryDistrict\(scene, layout\)/);
  assert.match(source, /createArchiveBuilding\(post, index, layout\[index\]\)/);
  assert.match(source, /function createPaperStack/);
  assert.match(source, /function createPostTube/);
  assert.match(source, /function createBrassOrbit/);
  assert.match(source, /function createFloatingFragments/);
  assert.match(source, /function createArchiveBeacon/);
  assert.match(source, /function createNeonWindowBands/);
  assert.match(source, /function createHologramBillboard/);
  assert.match(source, /function addDataRail/);
  assert.match(source, /const animatedArchiveObjects = \[\]/);
  assert.match(source, /animateArchiveAtmosphere\(time \* 0\.001\)/);
  assert.match(source, /function animateArchiveAtmosphere/);
  assert.match(source, /Neon Archive/);
  assert.match(source, /DATA DISTRICT/);
  assert.match(source, /Cyber data rail/);
  assert.match(source, /ARTICLE #/);
});

test('3D world uses a cyberpunk lighting palette and neon materials', async () => {
  const source = await worldSource();

  assert.match(source, /scene\.background = new Color\(0x061018\)/);
  assert.match(source, /scene\.fog = new Fog\(0x061018/);
  assert.match(source, /const cyberNeonPalette = \[/);
  assert.match(source, /0x3df8ff/);
  assert.match(source, /0xff2bd6/);
  assert.match(source, /0xb8ff2c/);
  assert.match(source, /emissiveIntensity/);
  assert.match(source, /MeshBasicMaterial\(\{ color: accent, transparent: true, opacity:/);
});

test('article buildings use higher resolution model detail instead of simple low-poly blocks', async () => {
  const source = await worldSource();

  assert.match(source, /InstancedMesh/);
  assert.match(source, /Object3D/);
  assert.match(source, /const MODEL_DETAIL_LEVEL = \{/);
  assert.match(source, /bodySegments:\s*3/);
  assert.match(source, /facadeRows:\s*12/);
  assert.match(source, /facadeColumns:\s*8/);
  assert.match(source, /function createHighResolutionFacade/);
  assert.match(source, /function createRooftopMachinery/);
  assert.match(source, /function createAerialConduitNetwork/);
  assert.match(source, /function createLayeredHologramFrame/);
  assert.match(source, /new InstancedMesh\(/);
  assert.match(source, /createHighResolutionFacade\(width, depth, height, accent, index\)/);
  assert.match(source, /createRooftopMachinery\(width, depth, height, accent, index\)/);
  assert.match(source, /createAerialConduitNetwork\(width, depth, height, accent, index\)/);
  assert.match(source, /createLayeredHologramFrame\(width, height, accent\)/);
  assert.match(source, /function createPlayer/);
  assert.match(source, /new CylinderGeometry\(0\.32, 0\.42, 0\.9, 48, 2\)/);
  assert.match(source, /new SphereGeometry\(0\.34, 48, 32\)/);
  assert.match(source, /visorMaterial/);
  assert.match(source, /backpack/);
  assert.match(source, /canvas\.width = 1024/);
  assert.match(source, /texture\.anisotropy = 4/);
});

test('3D world pauses rendering and input outside world mode', async () => {
  const source = await worldSource();

  assert.match(source, /let animationFrameId = 0/);
  assert.match(source, /window\.addEventListener\('home-mode-change', updateAnimationState\)/);
  assert.match(source, /document\.addEventListener\('visibilitychange', updateAnimationState\)/);
  assert.match(source, /window\.matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(source, /reducedMotionQuery\?\.addEventListener\('change', updateAnimationState\)/);
  assert.match(source, /function shouldReduceMotion\(\)/);
  assert.match(source, /return reducedMotionQuery\?\.matches === true/);
  assert.match(source, /if \(!isWorldModeRenderable\(\)\) return/);
  assert.match(source, /function isWorldModeRenderable\(\)/);
  assert.match(source, /return !shouldReduceMotion\(\) &&/);
  assert.match(source, /document\.visibilityState !== 'hidden'/);
  assert.match(source, /document\.documentElement\.dataset\.homeMode === 'world'/);
  assert.match(source, /!root\.closest\('\[hidden\]'\)/);
  assert.match(source, /root\.classList\.toggle\('blog-world--ready', !shouldReduceMotion\(\)\)/);
  assert.match(source, /root\.classList\.toggle\('blog-world--fallback', shouldReduceMotion\(\)\)/);
  assert.match(source, /function scheduleAnimation\(\)/);
  assert.match(source, /requestAnimationFrame\(animate\)/);
  assert.match(source, /function stopAnimation\(\)/);
  assert.match(source, /cancelAnimationFrame\(animationFrameId\)/);
  assert.match(source, /pressed\.clear\(\)/);
  assert.match(source, /heldControls\.clear\(\)/);
});

test('3D world has a more polished cinematic city composition', async () => {
  const source = await worldSource();

  assert.match(source, /ACESFilmicToneMapping/);
  assert.match(source, /toneMappingExposure = 1\.18/);
  assert.match(source, /PointLight/);
  assert.match(source, /function createArchiveSkyline/);
  assert.match(source, /function createLightCanopy/);
  assert.match(source, /function createGroundCircuitField/);
  assert.match(source, /function createEntryPortal/);
  assert.match(source, /createArchiveSkyline\(scene, layout\)/);
  assert.match(source, /createLightCanopy\(scene, layout\)/);
  assert.match(source, /createGroundCircuitField\(scene, layout\)/);
  assert.match(source, /createEntryPortal\(width, depth, height, accent, index\)/);
  assert.match(source, /camera = new PerspectiveCamera\(46/);
  assert.match(source, /player\.position\.x \+ 6\.4/);
  assert.match(source, /player\.position\.z \+ 10\.4/);
  assert.match(source, /\.world-brand h2\s*\{[\s\S]*font-size:\s*clamp\(1\.45rem, 3\.6vw, 2\.9rem\)/);
  assert.match(source, /\.world-brand\s*\{[\s\S]*width:\s*min\(18rem, calc\(100vw - 2rem\)\)/);
  assert.match(source, /\.world-brand\s*\{[\s\S]*clip-path:\s*polygon/);
  assert.match(source, /@media \(max-width: 720px\)[\s\S]*\.world-brand\s*\{[\s\S]*top:\s*7\.75rem/);
  assert.match(source, /@media \(max-width: 720px\)[\s\S]*\.world-brand h2\s*\{[\s\S]*font-size:\s*clamp\(1\.35rem, 7vw, 2\.4rem\)/);
  assert.match(source, /\.world-brand\s*\{[\s\S]*mix-blend-mode:\s*screen/);
  assert.match(source, /\.world-status\s*\{[\s\S]*clip-path:\s*polygon/);
  assert.match(source, /\.blog-world__shade\s*\{[\s\S]*repeating-linear-gradient/);
  assert.doesNotMatch(source, /radial-gradient\(circle at 76% 14%/);
});

test('buildings keep canonical article URLs and non-WebGL fallback links', async () => {
  const source = await worldSource();
  const readyFallbackRule = source.match(/\.blog-world--ready \.world-fallback\s*\{[^}]*\}/)?.[0] ?? '';
  const focusFallbackRule = source.match(/\.blog-world--ready \.world-fallback:focus-within\s*\{[^}]*\}/)?.[0] ?? '';

  assert.match(source, /url: `\/blog\/\$\{post\.id\}\/`/);
  assert.match(source, /data-world-fallback/);
  assert.match(source, /<a href=\{post\.url\}>\{post\.title\}<\/a>/);
  assert.match(source, /blog-world--fallback/);
  assert.doesNotMatch(readyFallbackRule, /display:\s*none/);
  assert.match(readyFallbackRule, /clip-path:\s*inset\(50%\)/);
  assert.match(focusFallbackRule, /clip-path:\s*none/);
});

test('world supports game movement and entering buildings to read', async () => {
  const source = await worldSource();

  assert.match(source, /keyToDirection\(event\.key\)/);
  assert.match(source, /if \(lowered === 'w' \|\| key === 'ArrowUp'\) return 'forward'/);
  assert.match(source, /if \(lowered === 's' \|\| key === 'ArrowDown'\) return 'back'/);
  assert.match(source, /if \(lowered === 'a' \|\| key === 'ArrowLeft'\) return 'left'/);
  assert.match(source, /if \(lowered === 'd' \|\| key === 'ArrowRight'\) return 'right'/);
  assert.match(source, /event\.defaultPrevented/);
  assert.match(source, /!isInteractiveTarget\(event\.target\)/);
  assert.match(source, /function isInteractiveTarget\(target\)/);
  assert.match(source, /data-move="forward"/);
  assert.match(source, /button\.addEventListener\('keydown'[\s\S]*heldControls\.add\(direction\)/);
  assert.match(source, /button\.addEventListener\('keyup'[\s\S]*stepControl\(direction\)/);
  assert.match(source, /button\.addEventListener\('click'[\s\S]*stepControl\(direction\)/);
  assert.doesNotMatch(source, /if \(event\.detail !== 0\) return/);
  assert.match(source, /function stepControl\(direction\)/);
  assert.match(source, /function directionToVector\(direction\)/);
  assert.match(source, /raycaster\.intersectObjects\(pickables, false\)/);
  assert.match(source, /entryPortal\.traverse\(\(child\) => \{/);
  assert.match(source, /child\.userData\.buildingIndex = index/);
  assert.match(source, /if \(child\.isMesh\) pickables\.push\(child\)/);
  assert.doesNotMatch(source, /pickables\.push\(entryPortal\)/);
  assert.match(source, /targetBuilding = building;\s*updateActiveBuilding\(\)/);
  assert.doesNotMatch(source, /activeBuilding = building;\s*target\.copy/);
  assert.match(source, /targetBuilding && activeBuilding === targetBuilding/);
  assert.match(source, /openReader\(activeBuilding\.post\)/);
  assert.match(source, /document\.querySelectorAll\('\[data-world-enter\]'\)\.forEach/);
});

test('world advertises WSAD keyboard movement and gamepad phone controls', async () => {
  const source = await worldSource();

  assert.match(source, /data-world-help/);
  assert.match(source, /WSAD/);
  assert.match(source, /arrow keys/);
  assert.match(source, /world-controls__pad/);
  assert.match(source, /world-controls__enter/);
  assert.match(source, /aria-label="Game controls"/);
  assert.match(source, /aria-label="Hold to move forward"/);
  assert.match(source, /aria-label="Enter selected building"/);
});

test('world control HUD splits movement pad left and enter key right', async () => {
  const source = await worldSource();

  assert.match(source, /<div class="world-controls__pad" aria-label="Move pad">/);
  assert.match(source, /class="world-controls__enter"[\s\S]*data-world-enter/);
  assert.match(source, /\.world-controls\s*\{[\s\S]*grid-template-columns:\s*minmax\(8\.5rem, 12rem\) minmax\(0, 1fr\) minmax\(5\.5rem, 8rem\)/);
  assert.match(source, /\.world-controls__pad\s*\{[\s\S]*grid-template-areas:[\s\S]*"\. up \."[\s\S]*"left down right"/);
  assert.match(source, /\.world-controls__enter\s*\{[\s\S]*grid-column:\s*3/);
  assert.match(source, /@media \(max-width: 720px\)[\s\S]*\.world-controls\s*\{[\s\S]*left:\s*1rem[\s\S]*right:\s*1rem/);
});

test('reader panel reuses article pages through iframe', async () => {
  const source = await worldSource();

  assert.match(source, /data-reader/);
  assert.match(source, /<iframe data-reader-frame/);
  assert.match(source, /readerFrame\.src = post\.url/);
  assert.match(source, /readerOpen\.href = post\.url/);
  assert.match(source, /data-reader-close-button/);
  assert.match(source, /readerCloseButton\.focus\(\)/);
});

test('3D scene is full-bleed and motion preference is acknowledged', async () => {
  const source = await worldSource();

  assert.match(source, /\.blog-world\s*\{[\s\S]*width:\s*100vw/);
  assert.match(source, /\.blog-world\s*\{[\s\S]*height:\s*min\(860px, calc\(100vh - 4rem\)\)/);
  assert.match(source, /@media \(max-width: 720px\)[\s\S]*\.world-controls\s*\{[\s\S]*position:\s*fixed/);
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
});
