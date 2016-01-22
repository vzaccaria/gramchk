function escapeAttrValue(attrValue) {
    return String(attrValue)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// errors should be like:
//

module.exports = function({ errorCollection, file}) {
    console.log('<?xml version="1.0" encoding="utf-8"?>\n<checkstyle version="4.3">');
    console.log('    <file name="' + file + '">');
    errorCollection.forEach(function(error) {
        console.log(
            '        <error ' +
                'line="' + (parseInt(error.fromy) + 1) + '" ' +
                'column="' + (parseInt(error.fromx) + 1) + '" ' +
            'severity="error" ' +
            'message="' + escapeAttrValue(error.editormessage) + '" ' +
            'source="'+error.source+'" />'
        );
    });
    console.log('    </file>');
    console.log('</checkstyle>');
};
