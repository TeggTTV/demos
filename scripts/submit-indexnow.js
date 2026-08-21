/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('Starting IndexNow submission...');

	// 1. Get site URL from next-sitemap config or environment variable
	let siteUrl = 'https://demosclubhub.vercel.app';
	try {
		const sitemapConfigPath = path.join(__dirname, '../next-sitemap.config.js');
		if (fs.existsSync(sitemapConfigPath)) {
			const sitemapConfig = require(sitemapConfigPath);
			if (sitemapConfig.siteUrl) {
				siteUrl = sitemapConfig.siteUrl;
			}
		}
	} catch (err) {
		console.warn('Could not read next-sitemap.config.js, using default:', err.message);
	}

	if (process.env.SITE_URL) {
		siteUrl = process.env.SITE_URL;
	}

	// Remove trailing slash if present
	siteUrl = siteUrl.replace(/\/$/, '');
	const host = new URL(siteUrl).hostname;

	// 2. Discover the IndexNow API key file in public directory
	let key = '';
	const publicDir = path.join(__dirname, '../public');
	if (fs.existsSync(publicDir)) {
		const files = fs.readdirSync(publicDir);
		const keyFile = files.find(f => /^[a-f0-9]{32}\.txt$/i.test(f));
		if (keyFile) {
			key = path.basename(keyFile, '.txt');
			console.log(`Discovered IndexNow key file: ${keyFile} (Key: ${key})`);
		}
	}

	if (!key) {
		console.error('Error: Could not find a 32-character hex key file (e.g. <key>.txt) in the public/ directory.');
		process.exit(1);
	}

	const keyLocation = `${siteUrl}/${key}.txt`;

	// 3. Extract URLs from local sitemap files
	const urls = new Set();
	const sitemapPaths = [
		path.join(publicDir, 'sitemap-0.xml'),
		path.join(publicDir, 'sitemap.xml')
	];

	for (const sitemapPath of sitemapPaths) {
		if (fs.existsSync(sitemapPath)) {
			console.log(`Reading sitemap from: ${path.basename(sitemapPath)}`);
			const content = fs.readFileSync(sitemapPath, 'utf-8');
			const locRegex = /<loc>(https?:\/\/[^\s<>]+)<\/loc>/g;
			let match;
			while ((match = locRegex.exec(content)) !== null) {
				const url = match[1];
				// Skip static file assets, indexes, and the sitemap itself
				const pathname = new URL(url).pathname;
				const isAsset = /\.(png|svg|xml|json|txt|jpg|jpeg|gif|ico|css|js)$/i.test(pathname);
				if (!isAsset) {
					urls.add(url);
				}
			}
		}
	}

	const urlList = Array.from(urls);

	if (urlList.length === 0) {
		console.error('Error: No URLs found to submit. Make sure you build/generate the sitemap first.');
		process.exit(1);
	}

	console.log(`Found ${urlList.length} pages to submit:`);
	urlList.forEach(url => console.log(` - ${url}`));

	// 4. Construct payload
	const payload = {
		host,
		key,
		keyLocation,
		urlList
	};

	console.log('\nPayload:', JSON.stringify(payload, null, 2));

	// 5. Send POST request to IndexNow
	console.log('\nSending submission to IndexNow...');
	try {
		const response = await fetch('https://api.indexnow.org/IndexNow', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify(payload)
		});

		if (response.ok) {
			console.log(`\nSuccess! IndexNow returned status: ${response.status} (${response.statusText})`);
		} else {
			const bodyText = await response.text();
			console.error(`\nFailed with status: ${response.status} (${response.statusText})`);
			console.error('Response:', bodyText);
			process.exit(1);
		}
	} catch (error) {
		console.error('\nNetwork or request error:', error);
		process.exit(1);
	}
}

main();
