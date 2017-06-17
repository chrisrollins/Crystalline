//serves dummy data for now, will connect to a DB later

module.exports = {
	getTopicList: function(){
		const data = [
			{title: "Welcome to the forum", poster: "Chris", replies: 2, postDate: "4/1/2017"},
			{title: "Test1", poster: "Chris", replies: 1, postDate: "5/10/2017"},
			{title: "Test2", poster: "Chris", replies: 3, postDate: "5/15/2017"},
			{title: "Test3", poster: "Guest", replies: 5, postDate: "6/10/2017"},
			{title: "Test4", poster: "Chris", replies: 0, postDate: "6/15/2017"},
		];
		return data;
	}
}