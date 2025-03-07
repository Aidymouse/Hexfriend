import * as ghpages from 'gh-pages';

ghpages.publish(
	'dist', // path to public directory
	{
		branch: 'gh-pages',
		//repo: 'https://github.com/Aidymouse/Hexfriend.git', // Update to point to your repository
		repo: 'git@github.com:Aidymouse/Hexfriend.git', // Update to point to your repository
		user: {
			name: 'Aidymouse', // update to use your name
			email: 'aidan@thewizardscat.co.nz', // Update to use your email
		},
		message: 'GH Pages Script',
	},
	(err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Deploy Complete!');
		}
	}
);
