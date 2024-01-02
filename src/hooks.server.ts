import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/dashboard'))
		if (!event.cookies.get('auth-token')) throw redirect(303, '/login');

	const response = await resolve(event);
	return response;
};
