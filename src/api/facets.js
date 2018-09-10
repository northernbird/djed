import resource from 'resource-router-middleware';
import facets from '../models/facets';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'facet',

	/** GET / - List all entities */
	index({ params }, res) {
		res.json(facets);
	},

});
