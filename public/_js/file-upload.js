/* https://pqina.nl/filepond/docs/api/plugins */
// console.log(FilePond);
FilePond.registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginFileEncode)
/* const pond = FilePond.create(); */
FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
});
FilePond.parse(document.body);