import resource from 'resource-router-middleware';
import facets from '../models/facets';


export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'facet',

	/** GET / - List all entities */
	index(req, res) {

	    if(!req.query){
	        console.log('Query Paramter is empty!');
            return res.send(500);
        }

        console.log('TEST : ' + process.env['METADATA_API_KEY']);

        console.log('Test : ' + JSON.stringify(req.query));
		return res.json(facets);
	},

});
