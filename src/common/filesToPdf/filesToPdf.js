angular.module( 'filesToPdf', [] ).service('filesToPdf', ['$rootScope', function($rootScope) {

	var pdfDefinition = {
		pageSize: "LETTER",
		content: [],
		pageMargins: [ 6, 21, 6, 21 ]
	};

	var images = [];

	// options = { 'buttonElementId' = '#buton', 'dropElementId' = '#dropzone', 'appendDropElementId': '#dropzone2', 'appendButtonElementId': '#button'}

	this.init = function(options){
		buttonElementId = typeof options.buttonElementId !== 'undefined' ? options.buttonElementId : false;
		dropElementId = typeof options.dropElementId !== 'undefined' ? options.dropElementId : false;

		appendButtonElementId = typeof options.appendButtonElementId !== 'undefined' ? options.appendButtonElementId : false;
		appendDropElementId = typeof options.appendDropElementId !== 'undefined' ? options.appendDropElementId : false;

		if(dropElementId){
			holder = document.getElementById(dropElementId);
			holder.ondragover = function () { $(this).toggleClass('hover'); return false; };
			holder.ondragend = function () { $(this).toggleClass('hover'); return false; };
			holder.ondrop = function (e) {
				$(this).toggleClass('hover');
				e.preventDefault();
				readAndProcessFiles(e.target.files || e.dataTransfer.files);
			};
		}

		if(buttonElementId){
			document.getElementById(buttonElementId).addEventListener('change', function(evt){
				var files = evt.target.files;
				readAndProcessFiles(files);
			});
		}

		if(appendDropElementId){
			appendHolder = document.getElementById(appendDropElementId);
			appendHolder.ondragover = function () { $(this).toggleClass('hover'); return false; };
			appendHolder.ondragend = function () { $(this).toggleClass('hover'); return false; };
			appendHolder.ondrop = function (e) {
				$(this).toggleClass('hover');
				e.preventDefault();
				addPageBreakToLastPage();
				readAndProcessFiles(e.target.files || e.dataTransfer.files);
			};
		}

		if(appendButtonElementId){
			document.getElementById(appendButtonElementId).addEventListener('change', function(evt){
				var files = evt.target.files;
				addPageBreakToLastPage();
				readAndProcessFiles(files);
			});
		}

	};

	readAndProcessFiles = function(files){

		$rootScope.$broadcast('pdfProcessingStart', []);

		fileProcesses = [];

		normalizePdfDefinition();

		holder.ondrop = function(e){
			e.preventDefault();
		};

		for (var i = 0; i < files.length; i++) {

			if(isImage(files[i].type)){
				fileProcesses.push(processImage(files[i]));
			}
			else if(isPdf(files[i].type)){
				fileProcesses.push(processPdf(files[i]));
			}

		}

		$.when.apply($, fileProcesses).done(function () {
			generatePdf();
			console.log(pdfDefinition);
		});

	};

	processImage = function(imageFile){

		var deferred = $.Deferred();

		var fileReader = new FileReader();

		fileReader.onload = function fileReaderOnLoad(evt) {
			var image = new Image();
			image.onload = function() {
				var imageForPdf = "";
				if(image.width > image.height){
					var canvas = document.createElement('canvas');
					var ctx = canvas.getContext("2d");
					canvas.width = this.width;
					canvas.height = this.height;
					imageForPdf = getRotatedImage(this, canvas, ctx);
				}else{
					imageForPdf = this.src;
				}
				addImageToPdfDefinition(imageForPdf);
				addImageToImageArray(imageForPdf);
				deferred.resolve();
			};

			var imageSrc = evt.target.result;

			image.src = imageSrc;
		};

		fileReader.readAsDataURL(imageFile);

		return deferred.promise();

	};

	processPdf = function(pdfFile){
		var deferred = $.Deferred();

		var fileReader = new FileReader();

		fileReader.onload = function webViewerChangeFileReaderOnload(evt) {

			var buffer = evt.target.result;
			pdf = new Uint8Array(buffer);

			$.when(processPdfPages(pdf)).done(function(){
				deferred.resolve();
			});

		};

		fileReader.readAsArrayBuffer(pdfFile);

		return deferred.promise();
	};

	processPdfPages = function(pdf) {

		var deferred = $.Deferred();

		var processes = [];

		PDFJS.getDocument(pdf).then(function(pdf) {
			for(var i = 0; i < pdf.pdfInfo.numPages; i++){
				var pageIndex = i+1;
				processes.push(addPdfPageToPdfDefinition(pdf, pageIndex));
			}

			$.when.apply($, processes).done(function () {
				deferred.resolve();
			});

		});

		return deferred.promise();

	};

	addPdfPageToPdfDefinition = function(pdf, pageIndex){

		var deferred = $.Deferred();

		pdf.getPage(pageIndex).then(function(page) {

			var canvas = document.createElement("canvas");

			var scale = 1;
			var viewport = page.getViewport(scale);

			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			var renderContext = {
				canvasContext: context,
				viewport: viewport
			};

			page.render(renderContext).then(function(){
				var pageImage = canvas.toDataURL("image/png");
				addImageToImageArray(pageImage);
				addImageToPdfDefinition(pageImage);
				deferred.resolve();
			});

		});

		return deferred.promise();
	};

	addImageToImageArray = function(img){
		images.push(img);
	};

	addImageToPdfDefinition = function(imageForPdf){

		pdfDefinition.content.push({

			image: imageForPdf,
			fit: ['600', '750'],
			pageBreak: 'after'

		});

	};

	generatePdf = function(){
		var lastPage = pdfDefinition.content.pop();
		pdfDefinition.content.push({

			image: lastPage.image,
			fit: ['600', '750']

		});

		console.log("pdfDefinition");
		console.log(pdfDefinition);


		pdfMake.createPdf(pdfDefinition).getBuffer(finishPdf);
	};

	finishPdf = function(pdfBuffer){
		$rootScope.$broadcast('pdfGenerated', pdfBuffer);
	};

	addPageBreakToLastPage = function(){
		var lastPage = pdfDefinition.content.pop();
		pdfDefinition.content.push({

			image: lastPage.image,
			fit: ['600', '750'],
			pageBreak: 'after'

		});
	};

	getRotatedImage = function(image, canvas, ctx){
		canvas.height = canvas.width;
		canvas.width = image.height;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(90 * Math.PI / 180);
		ctx = canvas.getContext('2d');
		ctx.drawImage(image, -image.width/2 , -image.height/2);
		ctx.restore();
		return canvas.toDataURL("image/png");
	};

	isImage = function(fileType){
		var imageFileTypes = ['image/png', 'image/jpeg', 'image/gif'];
		return imageFileTypes.indexOf(fileType) > -1;
	};

	isPdf = function(fileType){
		var pdfFileType = 'application/pdf';
		return fileType === pdfFileType;
	};

	normalizePdfDefinition = function(){
		delete pdfDefinition.images;
		pdfDefinition.content = [];
		for (var i = 0; i < images.length; i++) {
			addImageToPdfDefinition(images[i]);
		}
	};
}]);
