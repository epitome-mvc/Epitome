<?PHP

$id = isset($_REQUEST['id']) ? $_REQUEST['id'] : '';

$response = Array(
    'firstName' => Array('coda','This is the shit'),
    'foobar' => 'No',
    'foobar2' => 'Pre-populated',
    'propertyType' => 'property_type_1',
    'propertyTypeHouse' => 'Detatched house',
    'id' => $id
);

echo json_encode($response);

?>