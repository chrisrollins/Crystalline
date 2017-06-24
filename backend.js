//serves dummy data for now, will connect to a DB later

module.exports = {
	getTopicList: function(){
		const data = [
			{ poster: "Chris", title: "Welcome to the forum", replies: 2, postDate: "4/1/2017", postID: 0, posterID: 1 },
			{ poster: "Chris", title: "Test1", replies: 1, postDate: "5/10/2017", postID: 1, posterID: 1 },
			{ poster: "Chris", title: "Test2", replies: 3, postDate: "5/15/2017", postID: 2, posterID: 1 },
			{ poster: "Guest", title: "Test3", replies: 5, postDate: "6/10/2017", postID: 3, posterID: 2 },
			{ poster: "Chris", title: "Test4", replies: 0, postDate: "6/15/2017", postID: 4, posterID: 1 },
		];
		return data;
	}
}