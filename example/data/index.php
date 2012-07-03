<?PHP

header('Content-type: application/json');

function generateDummyData($count) {
    $result = Array();
    $id = rand(10000, 100000);
    while($count--) {
        $result[] = (object)array(
            'name' => 'Dimitar',
            'surname' => 'Christoff',
            'foo' => 'bar',
            'title' => 'Task #' . $id,
            'task' => 'Task body for ' . $id,
            'id' => $id
        );
        $id++;
    }
    return $result;
}

if (isset($_REQUEST['a']) && $_REQUEST['a'] == 'collection') {
    echo json_encode(generateDummyData(10));
    die;
}

// do a single model quickly.
$id = isset($_REQUEST['id']) ? $_REQUEST['id'] : rand(100, 1000000);

$response = generateDummyData(1);
$response[0]->id = $id;
unset($response[0]->title, $response[0]->task);

echo json_encode($response[0]);

?>