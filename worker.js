const version = "v3.1";

const addResourcesToCache = async (resources) => {
	const cache = await caches.open(version);
	console.log("Adding resources to cache:", resources.join(", "));
	await cache.addAll(resources);
};

const putInCache = async (request, response) => {
	const cache = await caches.open(version);
	await cache.put(request, response);
};

const networkFirst = async ({ request, fallbackUrl }) => {
	// First, try to get the resource from the network.
	try {
		const responseFromNetwork = await fetch(request);
		// If the network request succeeded, clone the response:
		// - put one copy in the cache, for the next time
		// - return the original to the app
		// Cloning is needed because a response can only be consumed once.
		putInCache(request, responseFromNetwork.clone());
		return responseFromNetwork;
	} catch (error) {
		const responseFromCache = await caches.match(request);
		if (responseFromCache) {
			return responseFromCache;
		}

		const fallbackResponse = await caches.match(fallbackUrl);
		if (fallbackResponse) {
			return fallbackResponse;
		}
		// When even the fallback response is not available,
		// there is nothing we can do, but we must always
		// return a Response object.
		return new Response("Network error happened", {
			status: 408,
			headers: { "Content-Type": "text/plain" },
		});
	}
};

self.addEventListener("fetch", (event) => {
	event.respondWith(
		networkFirst({
			request: event.request,
			fallbackUrl: "/fallback.html",
		}),
	);
});

self.addEventListener("install", (event) => {
	event.waitUntil(
		addResourcesToCache([
			"/",
			"/index.html",
			"/src/main.ts"
		]),
	);
});
