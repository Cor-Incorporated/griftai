// Sveltia CMS の npm 版（package.json で版固定。cor-jp.com と同じ 0.221.7）を Vite で同梱する。
// 設定は index.html の <link rel="cms-config-url"> が指す /config.yml。
import { init } from '@sveltia/cms';

init();
