desc "Download first image from dilbert rss feed and create a new record"
task :get_dilbert_feed => [:environment] do
  puts "> Downloading url"
  doc = Nokogiri::XML(open("https://kimmo.suominen.com/stuff/dilbert-daily.xml"))

  puts "> Parsing with nokogiri"
  original_image_url = Nokogiri::HTML(doc.xpath('//description')[1].text).at('img')['src']

  attributes = {
    title: doc.xpath('//title')[0].name,
    link: doc.xpath('//link')[0].text,
    publication_date: DateTime.parse(doc.xpath('//pubDate')[0].text),
    description: doc.xpath('//description')[0].text,
    guid: doc.xpath('//guid')[0].text,
    original_image_url: original_image_url,
    image: open(original_image_url)
  }

  puts "> Creating Record on Database"
  record = DilbertImage.create(attributes)
  puts "> Created? #{record.save}"
  puts "> Done!"

end
