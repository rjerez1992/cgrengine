var EditorRequest = {
	ZonesList : "editor.zones.list", 		//No parameters	
	DeleteZone : "editor.zones.delete", //Must send the id of the zone
	CreateZone : "editor.zones.new", //Must send name and size of the zone
	CreateMapAtZone : "editor.zone.map.new", ///Must send zone id, map row, map column and map name 
	UpdateMap : "editor.map.update", //Must send map object
	ClassList : "editor.class.list",
	CreateClass : "editor.class.create", //Must send all class objects
	UpdateClass : "editor.class.update" //Must send all class objects
}

var ServerResponse = {
	MapUpdated : "server.map.updated",
	ClassList : "server.class.list", //includes an json array with the classes
	ClassCreated : "server.class.created",
	ClassUpdated : "server.class.updated"
}