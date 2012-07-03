<?PHP

/*  You don't need to use PHP to use Epitome.
    This is just to ease testing as I run a MAMP server
*/


function generateDummyData($count) {
    // generates an array of pseudo models to use
    $result = Array();
    $id = rand(10000, 100000);

    function getValue($name, $value) {
        global $data;
        return isset($data[$name]) ? $data[$name] : $value;
    }

    while($count--) {
        $result[] = (object)array(
            'name' => getValue('name', 'Dimitar'),
            'surname' => getValue('surname', 'Christoff'),
            'foo' => getValue('foo', 'bar'),
            'title' => getValue('title', 'Title for ' . $id),
            'task' => getValue('task', 'Task for ' . $id),
            'id' => getValue('id', $id)
        );
        $id++;
    }
    return $result;
}



// main application responses (har har)
header('Content-type: application/json');


// normalise data for RESTful endpoints
if($_SERVER['REQUEST_METHOD'] == 'PUT') {
    parse_str(file_get_contents("php://input"), $data);
}
else {
    $data = $_REQUEST;
}

// is it a delete?
if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    // dunno what to output.
    echo '{"status": "success", "id": "'.$data['id'].'"}';
    die;
}

// this is a test ednpoint to produce some mock data
if (isset($data['a']) && $data['a'] == 'collection') {
    echo json_encode(generateDummyData(10));
    die;
}


// serve a single model quickly.
$id = isset($data['id']) ? $data['id'] : rand(100, 1000000);

// this will contain the original data 'updated' or newly generated one.
$response = generateDummyData(1);

echo json_encode($response[0]);

?>