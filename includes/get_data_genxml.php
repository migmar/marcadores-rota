<?php  

  require("miuller_dbinfo.php");

  // Get parameters from URL
  $center_lat = $_GET["lat"];
  $center_lng = $_GET["lng"];
  $radius = $_GET["radius"];

  // Start XML file, create parent node
  $dom = new DOMDocument("1.0");
  $node = $dom->createElement("markers");
  $parnode = $dom->appendChild($node);

  // Opens a connection to a mySQL server
  $connection=mysql_connect ("localhost", $username, $password);

  if (!$connection) {
    die("Not connected : " . mysql_error());
  }

  // Set the active mySQL database
  $db_selected = mysql_select_db($database, $connection);
  if (!$db_selected) {
    die ("Can\'t use db : " . mysql_error());
  }

  // Search the rows in the markers table
  $query = sprintf("SELECT geoloc_id, geoloc_nomeprop, geoloc_nomefazenda, geozona_nome, geoloc_latitude, geoloc_longitude, ( 6371 * acos( cos( radians('%s') ) * cos( radians( geoloc_latitude ) ) * cos( radians( geoloc_longitude ) - radians('%s') ) + sin( radians('%s') ) * sin( radians( geoloc_latitude ) ) ) ) AS distance FROM geoloc INNER JOIN geozona ON geoloc.geozona_id=geozona.geozona_id HAVING distance < '%s' ORDER BY distance LIMIT 0 , 30",
    mysql_real_escape_string($center_lat),
    mysql_real_escape_string($center_lng),
    mysql_real_escape_string($center_lat),
    mysql_real_escape_string($radius));
  $result = mysql_query($query);

  if (!$result) {
    die("Invalid query: " . mysql_error());
  }

  header("Content-type: text/xml");

  // Iterate through the rows, adding XML nodes for each
  while ($row = @mysql_fetch_assoc($result)){
    $node = $dom->createElement("marker");
    $newnode = $parnode->appendChild($node);
    $newnode->setAttribute("geoloc_id", $row['geoloc_id']);
    $newnode->setAttribute("geoloc_nomeprop", utf8_encode($row['geoloc_nomeprop']));
    $newnode->setAttribute("geoloc_nomefazenda", utf8_encode($row['geoloc_nomefazenda']));
    $newnode->setAttribute("geozona_nome", utf8_encode($row['geozona_nome']));
    $newnode->setAttribute("lat", $row['geoloc_latitude']);
    $newnode->setAttribute("lng", $row['geoloc_longitude']);
    $newnode->setAttribute("distance", $row['distance']);
  }
  echo $dom->saveXML();
  ?>