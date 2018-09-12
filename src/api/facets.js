import resource from 'resource-router-middleware';
import analyser from '../service/recommend/recommendAnalyser';
import wait from 'wait.for';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'facet',

	/** GET / - List all entities */
	index(req, res) {

	    if(!req.query || !req.query.searchText || !req.query.author){
	        console.log('Query Paramter is empty!');
            return res.send(500);
        }

        console.log('Request : ' + JSON.stringify(req.query));
        wait.launchFiber(handle, req, res);


	},

});

function handle(req, res) {

    const searchText = req.query.searchText;
    const author = req.query.author;
    const result = analyser.analyse(author, searchText)
    return res.json(result);

}
