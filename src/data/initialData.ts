import { Hub, Destination, Attraction, Homestay, Route } from '../types';

export const initialHubs: Hub[] = [
  {
    "id": "Ahaldara",
    "name": "Ahaldara",
    "type": "main_hub"
  },
  {
    "id": "Algarah",
    "name": "Algarah",
    "type": "main_hub"
  },
  {
    "id": "Alipurduar",
    "name": "Alipurduar",
    "type": "main_hub"
  },
  {
    "id": "Ambootia",
    "name": "Ambootia",
    "type": "main_hub"
  },
  {
    "id": "Ambotia",
    "name": "Ambotia",
    "type": "main_hub"
  },
  {
    "name": "Arya",
    "type": "main_hub",
    "id": "Arya"
  },
  {
    "type": "main_hub",
    "name": "Badamtam",
    "id": "Badamtam"
  },
  {
    "id": "Bagdogra",
    "type": "main_hub",
    "name": "Bagdogra"
  },
  {
    "id": "Bagora",
    "type": "main_hub",
    "name": "Bagora"
  },
  {
    "type": "main_hub",
    "name": "Bagrakote",
    "id": "Bagrakote"
  },
  {
    "id": "Balurghat",
    "name": "Balurghat",
    "type": "main_hub"
  },
  {
    "name": "Baneswar",
    "type": "main_hub",
    "id": "Baneswar"
  },
  {
    "name": "Bangarh",
    "type": "main_hub",
    "id": "Bangarh"
  },
  {
    "type": "main_hub",
    "name": "Batabari",
    "id": "Batabari"
  },
  {
    "id": "Bikeybhanjang",
    "type": "main_hub",
    "name": "Bikeybhanjang"
  },
  {
    "type": "main_hub",
    "name": "Bindu",
    "id": "Bindu"
  },
  {
    "id": "Bolla",
    "name": "Bolla",
    "type": "main_hub"
  },
  {
    "name": "Buxa Fort",
    "type": "main_hub",
    "id": "Buxa Fort"
  },
  {
    "id": "Castleton",
    "type": "main_hub",
    "name": "Castleton"
  },
  {
    "name": "Chalsa",
    "type": "main_hub",
    "id": "Chalsa"
  },
  {
    "name": "Changrabandha",
    "type": "main_hub",
    "id": "Changrabandha"
  },
  {
    "name": "Chapramari",
    "type": "main_hub",
    "id": "Chapramari"
  },
  {
    "type": "main_hub",
    "name": "Charkhole",
    "id": "Charkhole"
  },
  {
    "id": "Chekamari",
    "name": "Chekamari",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Chilapata",
    "id": "Chilapata"
  },
  {
    "id": "Chimney",
    "name": "Chimney",
    "type": "main_hub"
  },
  {
    "id": "Chitrey",
    "name": "Chitrey",
    "type": "main_hub"
  },
  {
    "id": "Chopra",
    "name": "Chopra",
    "type": "main_hub"
  },
  {
    "id": "Chuikhim",
    "type": "main_hub",
    "name": "Chuikhim"
  },
  {
    "id": "Cooch Behar",
    "type": "main_hub",
    "name": "Cooch Behar"
  },
  {
    "name": "Damdim",
    "type": "main_hub",
    "id": "Damdim"
  },
  {
    "type": "main_hub",
    "name": "Darjeeling",
    "id": "Darjeeling"
  },
  {
    "id": "Dawaipani",
    "name": "Dawaipani",
    "type": "main_hub"
  },
  {
    "id": "Delo",
    "name": "Delo",
    "type": "main_hub"
  },
  {
    "name": "Dhupguri",
    "type": "main_hub",
    "id": "Dhupguri"
  },
  {
    "type": "main_hub",
    "name": "Dhupjhora",
    "id": "Dhupjhora"
  },
  {
    "id": "Dinhata",
    "type": "main_hub",
    "name": "Dinhata"
  },
  {
    "id": "Durpin",
    "type": "main_hub",
    "name": "Durpin"
  },
  {
    "id": "Falakata",
    "type": "main_hub",
    "name": "Falakata"
  },
  {
    "id": "Fikkalaygaon",
    "type": "main_hub",
    "name": "Fikkalaygaon"
  },
  {
    "type": "main_hub",
    "name": "Gairibas",
    "id": "Gairibas"
  },
  {
    "name": "Gajoldoba",
    "type": "main_hub",
    "id": "Gajoldoba"
  },
  {
    "type": "main_hub",
    "name": "Gangarampur",
    "id": "Gangarampur"
  },
  {
    "type": "main_hub",
    "name": "Gayabari",
    "id": "Gayabari"
  },
  {
    "name": "Ghayabari",
    "type": "main_hub",
    "id": "Ghayabari"
  },
  {
    "id": "Ghum",
    "type": "main_hub",
    "name": "Ghum"
  },
  {
    "name": "Gitdubling",
    "type": "main_hub",
    "id": "Gitdubling"
  },
  {
    "type": "main_hub",
    "name": "Goalpokhar",
    "id": "Goalpokhar"
  },
  {
    "id": "Gopaldhara",
    "name": "Gopaldhara",
    "type": "main_hub"
  },
  {
    "id": "Gorkhey",
    "type": "main_hub",
    "name": "Gorkhey"
  },
  {
    "type": "main_hub",
    "name": "Gorubathan",
    "id": "Gorubathan"
  },
  {
    "id": "Gorumara",
    "type": "main_hub",
    "name": "Gorumara"
  },
  {
    "type": "main_hub",
    "name": "Haripur",
    "id": "Haripur"
  },
  {
    "id": "Hasimara",
    "type": "main_hub",
    "name": "Hasimara"
  },
  {
    "id": "Hemtabad",
    "type": "main_hub",
    "name": "Hemtabad"
  },
  {
    "name": "Hili",
    "type": "main_hub",
    "id": "Hili"
  },
  {
    "name": "Hollong",
    "type": "main_hub",
    "id": "Hollong"
  },
  {
    "type": "main_hub",
    "name": "Icchey Gaon",
    "id": "Icchey Gaon"
  },
  {
    "id": "Islampur",
    "name": "Islampur",
    "type": "main_hub"
  },
  {
    "id": "Itahar",
    "type": "main_hub",
    "name": "Itahar"
  },
  {
    "id": "Jalapahar",
    "name": "Jalapahar",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Jaldhaka",
    "id": "Jaldhaka"
  },
  {
    "id": "Jayanti",
    "type": "main_hub",
    "name": "Jayanti"
  },
  {
    "name": "Jhalong",
    "type": "main_hub",
    "id": "Jhalong"
  },
  {
    "id": "Jhepi",
    "name": "Jhepi",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Jogighat",
    "id": "Jogighat"
  },
  {
    "id": "Kafer",
    "name": "Kafer",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Kaiyakatta",
    "id": "Kaiyakatta"
  },
  {
    "id": "Kaliaganj",
    "type": "main_hub",
    "name": "Kaliaganj"
  },
  {
    "id": "Kalimpong",
    "type": "main_hub",
    "name": "Kalimpong"
  },
  {
    "type": "main_hub",
    "name": "Kalipokhri",
    "id": "Kalipokhri"
  },
  {
    "id": "Karandighi",
    "type": "main_hub",
    "name": "Karandighi"
  },
  {
    "id": "Khunia",
    "type": "main_hub",
    "name": "Khunia"
  },
  {
    "name": "Kodalbasti",
    "type": "main_hub",
    "id": "Kodalbasti"
  },
  {
    "id": "Kolakham",
    "name": "Kolakham",
    "type": "main_hub"
  },
  {
    "id": "Kranti",
    "type": "main_hub",
    "name": "Kranti"
  },
  {
    "name": "Kulik",
    "type": "main_hub",
    "id": "Kulik"
  },
  {
    "type": "main_hub",
    "name": "Kumargram",
    "id": "Kumargram"
  },
  {
    "name": "Kurseong",
    "type": "main_hub",
    "id": "Kurseong"
  },
  {
    "name": "Kushmandi",
    "type": "main_hub",
    "id": "Kushmandi"
  },
  {
    "name": "Lamahatta",
    "type": "main_hub",
    "id": "Lamahatta"
  },
  {
    "id": "Lataguri",
    "name": "Lataguri",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Latpanchar",
    "id": "Latpanchar"
  },
  {
    "id": "Lava",
    "name": "Lava",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Lepchajagat",
    "id": "Lepchajagat"
  },
  {
    "id": "Lepchakha",
    "type": "main_hub",
    "name": "Lepchakha"
  },
  {
    "id": "Lingse",
    "name": "Lingse",
    "type": "main_hub"
  },
  {
    "id": "Lingsey",
    "type": "main_hub",
    "name": "Lingsey"
  },
  {
    "id": "Lingtam",
    "name": "Lingtam",
    "type": "main_hub"
  },
  {
    "id": "Lolegaon",
    "name": "Lolegaon",
    "type": "main_hub"
  },
  {
    "name": "Madarihat",
    "type": "main_hub",
    "id": "Madarihat"
  },
  {
    "type": "main_hub",
    "name": "Mahakal Cave",
    "id": "Mahakal Cave"
  },
  {
    "id": "Mahaldiram",
    "name": "Mahaldiram",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Mainaguri",
    "id": "Mainaguri"
  },
  {
    "name": "Makaibari",
    "type": "main_hub",
    "id": "Makaibari"
  },
  {
    "type": "main_hub",
    "name": "Malbazar",
    "id": "Malbazar"
  },
  {
    "id": "Manebhanjan",
    "type": "main_hub",
    "name": "Manebhanjan"
  },
  {
    "id": "Mankhim",
    "type": "main_hub",
    "name": "Mankhim"
  },
  {
    "id": "Margaret's Hope",
    "name": "Margaret's Hope",
    "type": "main_hub"
  },
  {
    "id": "Mateli",
    "name": "Mateli",
    "type": "main_hub"
  },
  {
    "id": "Mathabhanga",
    "type": "main_hub",
    "name": "Mathabhanga"
  },
  {
    "type": "main_hub",
    "name": "Meghma",
    "id": "Meghma"
  },
  {
    "id": "Mekhliganj",
    "type": "main_hub",
    "name": "Mekhliganj"
  },
  {
    "type": "main_hub",
    "name": "Mendabari",
    "id": "Mendabari"
  },
  {
    "type": "main_hub",
    "name": "Meteli",
    "id": "Meteli"
  },
  {
    "type": "main_hub",
    "name": "Mirik",
    "id": "Mirik"
  },
  {
    "id": "Mongpong",
    "type": "main_hub",
    "name": "Mongpong"
  },
  {
    "id": "Mungpoo",
    "type": "main_hub",
    "name": "Mungpoo"
  },
  {
    "name": "Munsong",
    "type": "main_hub",
    "id": "Munsong"
  },
  {
    "name": "Murti",
    "type": "main_hub",
    "id": "Murti"
  },
  {
    "id": "NJP",
    "name": "NJP",
    "type": "main_hub"
  },
  {
    "id": "Nagrakata",
    "name": "Nagrakata",
    "type": "main_hub"
  },
  {
    "id": "Namthing",
    "name": "Namthing",
    "type": "main_hub"
  },
  {
    "id": "Nayabasti",
    "type": "main_hub",
    "name": "Nayabasti"
  },
  {
    "id": "North Point",
    "type": "main_hub",
    "name": "North Point"
  },
  {
    "type": "main_hub",
    "name": "Odlabari",
    "id": "Odlabari"
  },
  {
    "id": "Pabong",
    "name": "Pabong",
    "type": "main_hub"
  },
  {
    "name": "Pankhasari",
    "type": "main_hub",
    "id": "Pankhasari"
  },
  {
    "id": "Paren",
    "type": "main_hub",
    "name": "Paren"
  },
  {
    "name": "Patiram",
    "type": "main_hub",
    "id": "Patiram"
  },
  {
    "type": "main_hub",
    "name": "Pedong",
    "id": "Pedong"
  },
  {
    "id": "Peshok",
    "type": "main_hub",
    "name": "Peshok"
  },
  {
    "id": "Phalut",
    "type": "main_hub",
    "name": "Phalut"
  },
  {
    "id": "Poobong",
    "name": "Poobong",
    "type": "main_hub"
  },
  {
    "name": "Raiganj",
    "type": "main_hub",
    "id": "Raiganj"
  },
  {
    "type": "main_hub",
    "name": "Rajabhatkhawa",
    "id": "Rajabhatkhawa"
  },
  {
    "type": "main_hub",
    "name": "Ramdhura",
    "id": "Ramdhura"
  },
  {
    "type": "main_hub",
    "name": "Rammam",
    "id": "Rammam"
  },
  {
    "id": "Rangbull",
    "type": "main_hub",
    "name": "Rangbull"
  },
  {
    "type": "main_hub",
    "name": "Rasik Beel",
    "id": "Rasik Beel"
  },
  {
    "name": "Reshi",
    "type": "main_hub",
    "id": "Reshi"
  },
  {
    "id": "Reshikhola",
    "name": "Reshikhola",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Rikisum",
    "id": "Rikisum"
  },
  {
    "name": "Rimbik",
    "type": "main_hub",
    "id": "Rimbik"
  },
  {
    "name": "Rishop",
    "type": "main_hub",
    "id": "Rishop"
  },
  {
    "name": "Rocky Island",
    "type": "main_hub",
    "id": "Rocky Island"
  },
  {
    "id": "Rohini",
    "type": "main_hub",
    "name": "Rohini"
  },
  {
    "id": "Rongli",
    "name": "Rongli",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Sabargram",
    "id": "Sabargram"
  },
  {
    "id": "Samsing",
    "name": "Samsing",
    "type": "main_hub"
  },
  {
    "id": "Sandakphu",
    "name": "Sandakphu",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Santalabari",
    "id": "Santalabari"
  },
  {
    "name": "Sevoke Corridor",
    "type": "main_hub",
    "id": "Sevoke Corridor"
  },
  {
    "id": "Siddheshwari",
    "type": "main_hub",
    "name": "Siddheshwari"
  },
  {
    "id": "Siliguri",
    "name": "Siliguri",
    "type": "main_hub"
  },
  {
    "name": "Sillery Gaon",
    "type": "main_hub",
    "id": "Sillery Gaon"
  },
  {
    "type": "main_hub",
    "name": "Simana",
    "id": "Simana"
  },
  {
    "type": "main_hub",
    "name": "Singla",
    "id": "Singla"
  },
  {
    "type": "main_hub",
    "name": "Singtom",
    "id": "Singtom"
  },
  {
    "name": "Sitai",
    "type": "main_hub",
    "id": "Sitai"
  },
  {
    "id": "Sitalkuchi",
    "name": "Sitalkuchi",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Sittong",
    "id": "Sittong"
  },
  {
    "type": "main_hub",
    "name": "Sonada",
    "id": "Sonada"
  },
  {
    "type": "main_hub",
    "name": "Soureni",
    "id": "Soureni"
  },
  {
    "id": "Srikhola",
    "name": "Srikhola",
    "type": "main_hub"
  },
  {
    "type": "main_hub",
    "name": "Sukhiapokhri",
    "id": "Sukhiapokhri"
  },
  {
    "id": "Suntalekhola",
    "type": "main_hub",
    "name": "Suntalekhola"
  },
  {
    "name": "Takdah",
    "type": "main_hub",
    "id": "Takdah"
  },
  {
    "type": "main_hub",
    "name": "Tangta",
    "id": "Tangta"
  },
  {
    "id": "Tarkhola",
    "type": "main_hub",
    "name": "Tarkhola"
  },
  {
    "id": "Thurbo",
    "name": "Thurbo",
    "type": "main_hub"
  },
  {
    "name": "Tinchuley",
    "type": "main_hub",
    "id": "Tinchuley"
  },
  {
    "type": "main_hub",
    "name": "Tingling",
    "id": "Tingling"
  },
  {
    "id": "Todey",
    "name": "Todey",
    "type": "main_hub"
  },
  {
    "id": "Totopara",
    "type": "main_hub",
    "name": "Totopara"
  },
  {
    "id": "Tufanganj",
    "type": "main_hub",
    "name": "Tufanganj"
  },
  {
    "id": "Tumling",
    "type": "main_hub",
    "name": "Tumling"
  }
];

export const initialDestinations: Destination[] = [
  {
    "isFeaturedThisWeek": true,
    "tourismType": "Offbeat, Forest",
    "image": "data:image/webp;base64,UklGRmqkAABXRUJQVlA4WAoAAAAgAAAAVwIAUQEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggfKIAAHArAp0BKlgCUgE+wUybS6ekIie2Of2A8BgJYgb45ku+D6vIOcN5jxymPL1xmz/J9+302/3j0huj55ufOS9Qn+Y9I7qifRw85z1kv8rv+Wnd8nf6vgr+dfZv+LzWsTfa1qR/Vv2t/39bv+D32/rX9j6Bf6x/lf/r6dr/vttQN8bHrRTa/o7UH/b31E8BCgb5Rf/l+8/pR/ff/T+7/wG/3P/hfup2zfSJd1Gfj3tjRSTCKNutsYxbbO/YNSI3dY9wrFq7OuQk7st7l1hpZgBqt7bkfCghhDKBnP2/UwdrSZTHA/TFma+P8fH08dKX8GqrbqeShEAMwcgwGeSW+F/WnhXvkuQhLqgx673yLhuYYvyTVSzzMZxW9RBKLAo1P+jXvT+OUkmwMy5qzq4nOXJQ1dtI+EDvHLPxt5aAcfeZ/AfO1gLlPQrDgply9I9bNtfjdgnEeZLjhOY9LuaFtuHTPhZWkbS6E1opLau6qlxgiUNoJlmSq6ZErVDQxg9zcJVEvrtYrVU3TKdOz3ObW1iMxa77n7Uo4G9d6N6YOLJjPvr5/nxjwcXflI3mF/pGsrvMlVOGWK+s06j5LU1Td2yKzeR7p4sSHiWZcIJ9wdUFbGNTKV/14s3A7SvRYg3GiiHgL1GgX5cMSRGeFmqfYP/pI4NPfRnLzn8sHbFVokkaLUVywAEnbTHlO+dJrh16gDpeDikylx+iFyfy/FSDz/SAB/WPMFE7AolHQw3KPjQYlIBrRrWmwywT7KBqI8MVQc6IwhYkSuWahl5i8L1zmTa+LhLBT5LafxUiP0QrYkjUp1iNXiIdwkJv7MV/dR5jOO1eFoLpwNyLXJGXphzijaPrfNYOeTJD5S3XoEWqmfjHh6Fr/oYXUdtVRcSa/Hh4OfVkm2snJjzW22dK6u7o6l2qR3IpkvfTnTOQY/w9UNjIfZIBTec8YkbvwTdHqBoN53GfOGMRDUt/Fgf+Oa+4Hu877OOq0Zql/GOMHZQLUN0YTmGmNNTAXrnlgdBKuQ64h9mbvPulGNOUBvviGfce5am7YAVFa/sLs0f9r6ZmE9IQeC2XBiRqQahko/wUfdaudVV802p/4uShS7FiICBWHztzqzXtBZmLSJ42GRkdJFj80U3QulLoi3tOZ9SEg6VzWh11oOfJTONZH8U1OTmXBSIlpdm8Vn4/pQsidnPv/3rQUAUtJLg/rEnHS6GcuxMQ6cuV/YnNiCuISouqgKHhGd1z+oABaeomKFDETW5g7FtEY5g/otnnvQmegFTpHwef+ByxMxSWaLq3WycpTFxffas17XlfbuuPF1SA6aWW+YsX6zUg0LGh7qBIyg/rMtu5ioNYoMVqVZ5cUcLtgnIpkixFeW0HjqNjHUZiftK27Cf9xMvMrHSX2KAvPT0bz/Ytq/4bcfrryzRefNVj2FiPUmzuUHcreQC3hvr0PbtOzShSsE68y+AzWk2OIv08ToDi2h5OmvwNe6g80sCZwyxLsYRaRqSxglkpUtEsMyfsx1XkWRPGlix79/OoLZAlG07EkFa6Fm4ByAq1xFXcrm3gCp7hhXqa+1o1CQsFV8KdWPBCa4JodCSwhMOpCgH6DsdHwxx+xPcyMankaeXKFoUlBpiHaa8GJOU3d7fJizH7MI0nUCiPPUOG7F2nKgrh7cjsCGrjxEyau3hHYmVwda+dxn2y4+ZP2oiFCAwwDgf9MQ3li+P4FionTsUJHDLVXZrLeJfFd0/BZJuPEFk+LHe6iv600rUs3PXsGJpMsNoPxMTS8SVZHSxcNyzHWa3Vm58mU+vN5r9ddDoOc1Bghv2FPbnWJWp+4vROy20hkzVUsf/qpPZx6vuxyWFRhQfkNOgUPSsgM/WUKcZXmF2hGDTRKxJzpH6erOb5wEAN6Gzg8L0JF6BL4EtiCW17/EY0ewfdTSoiIu/xbAYPxWP57RRi0Ksbk2vpe69NGlzBAZCdPccFD/YzR+90ITYL4fxapvp3oq9jzDlcgd3BofzoDYv26IqQBGJiT5PlKlPE2luo0KgFHuGQkC6H+p4ZUzjSQHUPa862o5F6CqJstCLay2X/sTor/VUWNP390i0ItGCCwZwEVkP8xSAz4fodXt0PJ1FG+FXI/hJRRZ1GsD+nlpuLgFb13ytHbJFg0fbOgc0H9AeaJl5BJ8S1VVQR1hC7uqNa9STyeuavTZVzH7CksUx4dG3d3g169h8r42PJwvNqXkojR1ZkX/iDtRvpLuhfswjVDgm5+rXgOLT+w+Wj4V0iXb0ONOvn26KOGfzwQm9PpXvUpcER5GZLWMkK0L9XgFIvX6oF5MUKx6g9N6ZUHBQCCvB92ew7WEyLp0Gug+DOCi8hvhOvjkWCWEiMt4935cmzNMMY5Z9jWONjhplqfvCIMbo3PEZ+8Y6ACE0tK9wgDGRsbLjLE5NYCEi5SN9J1TevVrOncTcuYNgjZ6f/N7h08sAy8MyVncRJmInkcu7gBoIU8L3l/ibpCkqNyPHQyRDjXoDRfzwX91HYCR7JLrOAkTwwtP0Z3/mbrDckur4PWA9lfSuIQ0JLdz7qpuUsnR1yW2FQKzww4nVqK+dNVU6xEFnxPo3UyIsAB/VwcedCOHdgb//a1foIAaCCoT7NKnS3/fU5XkbS5XrrA/QwjCMtUN6xPABePr9kznltwXUJ9RMnrXqTtmYNQk4GTz9hPJYFEq9klETaAResprujXr4xFvpCRIJ6rb0UREgc7ego63fslhU1jaaiWNywP4zteJ7m5agU6OGb+hbrmMdDnRGlhgrePio2yFDkn6gsYcqX1MkWUQNAIlSo99pY414D817umSHyhFybhPJmSDKoBORHNkM31tyedo6t/+MLXqdpbNb5hp6a36P7Pt+ffsTk09M3aQpu6HSRBj9AVd5/hg3w3QVQs6nElQtKWj8Xe+yC1TBNzzSxHWW/fn6cnKZHWtyqp5Pgoyfika06o4lbH53CJDTcp9bfSPvrWB6WwDLU+EuyvO/kXvrkQ3UGjBZouvyQ8bJcMoVkqbZFinZmW/HYt3Q8mJZOvTNkI69C+uchPxsYaFDwRtv7r/wY+w6HdLD696c/gDZF0Vtjccg6yw1ezPX0O/4jrxJhAN64qLspjJdvYEmW6z/GdUhV1n4AQd5OPe4AUVUC/0hEyNJevm2sWS7Yq565JxKpi8+yV/xOw54/uKmQi8HhZPAwr8iahM0pFu//oMnN+1Qn3auL67Naosk7lL5JJE43qzJxOK1wW+K1ZbXg3Iix5ulkeMefGb/Ksov8FuF7tbbhtICjxYNIZGwkjJkRqovbWRPVeYOwz5BCtmxCsDsKhHW3Ag5ciSBvmflxVio0MxvdaK1wZtNvu8I6ocX2mBT9xXGVWBrAxbz/ST1vyYgupGazRajwazyKxZs93pDKwhrk9FSw+uRQv2B3THTnQozz/Y+CKP8ds7iC69T+bDlCMYTVv0roEE7KbKcjt04JriwsjBjN5lKz2qHRj94KmDGmZXpoa06lXClkqibedl7GOVLrVwHkgZjh7tVbOCmb2ndEyU/w85FpSnp+lfH995sIZUu8R6UeJnBKahcW1cO/xp7+33LVz7wMJGg9hh3Ttc6x/2MU3XPOlVFCBcKNXvqzvWMr5ECOkB9W21cQ5SnS+sazY9fX7VFmzAH1LDEgbJzK9Vqyg3JtV8C+I7CjoWbzs1pL0p0xzVhNpijGsmz0H7M+S/uQMRQFdZyuLZNpRHUp1K4LCruP+dtp7QjImK+MkdN3zg//roYYO8m+cZzpBpryn33cYYw0p3EHB2Yc1PHeqyxmRAz5evfD3DMwQKYj8AQ3I7zvjiZBi7AHALYV1zo5MJyYaFVPaV1BGn4bDks4dV6D0ByWBmCV1zE945n53bX1rApYtg89v3y9n1E607eqMU2NC22qFK2xrozkPOkdGXVhzBh6lFkSCKR6t6o7ddtd8+szr0wa5G8XT5xfTcR3LK8A778xox/76ieL3slh8jW3IqeiMfPvoXyRyKyc3GhN7H7itT5cVr80qwCzA1wuIQNyne7BVSMfl+/kTKZM85fEH+BlAMnWjC/2UgnTgS37RtJWMa6ZRX1G+Paf2rIl4coF/MqhA3LhaKjcm6inB2L4R00p5NmreP0VMOAchySSwf9o7XN+fddRkj2SK1lhMeJJGgSfK93iIAPLEr3RoTVsVYjnSaxo+0zSc+eQUUoGTWPPwIjh3exFhrnXodFDXsLew1T+X1IbJ7QtCTZtzBODdlx6CeRQPumb9PbmMpwo1m7QOPxAOycUVjcdDQmttGvq1JI4tosUmPyoY3pkKepENSHuqqumEwlt0KlCTKkPuFRJBZuv41VMfyFfY8Fpr4C4SHN8XpTHorCmqjPXbqO3ZHynUmEvLzAH3UgBzXuVlK5r5LuDZzQOSzuTLwOtJG0UQh4/t8/faWsGk3zIDV3+loc0GgbagjHivaAtha/vpFTdDc9ebQBUldKg5XGYn8ttU+DyCSHFk+4EKrzl252aEk4EQ57Ldem69cDi8bpD+G6WjE/GXEF76Fff9q3NUxjsAt+BeSnuhYpNIIfSIHHJ8TrONZlr+D+CFDrC4ZpNjmltrnkgX2ACQdzKg99D+/2Asexduia0AfuugdUY29rIv4BZh8DpeyMWa/xce/rx/ylWQtzKYkJE05d826Hf4l6p31qw2R4Nml3CrOIA2CqolgF0xJYX3MHZRXLyfvi2k1/2vJysk4jx9KhLLlewVhH5IpqTta13wJ/3/3pNJBCJdu2F1DzF0xERAiYYQ1abddBPX7DO+sewAsx53NIO0FPtlMdHYcmWDvR9mm+x/hXmyD8hmyxoDSpXM/7YgF50gL/lNcUQYD4L97G2TWhHKrT8JMytwP9mdATaTttm46WEze8lwx5gvljhhHbKvmi0AP3teyITG2dkKtCyOGoU76rla5QXHzo3pREyZM9LedB8yksLV2OYkPCcRZ2ClqpWWxjfYWFr3vDeif0Z2bFFlEgYM9SbVzFXq/utZY8bARd0w0xx3Mfjh+iyGzI7PhwHEM/p+8ukdqq2habu2svxKx2/nkWS/1oqpkUwa6Y6KzxwyaYSawaqy3+xSqBacX3maYU1q2LPx7ZbnmLHi8xx3Uk8QLIGhCLfhapMaWq9QdhPN16bpwxyk0FyYd83v/JTvA3/2hJCRC52ehOIVmXSul+zXYos5qZ9YRaBnfmJ61tcGDw5lj80wv3iD5fm4XcaEY4SpMksLVsDK33rWwD6ywJzLL271tJjSXtMO9ZFk9wtzHoFo2RsMS7DjQY+N0CXolIpXrBQR/j3DnEXyiJKIIvP9ZTIKu2cNPNHp/BR88k8mJN3kOwLkbktUZe8IhcefHx3m0RLwxPKcTnpkqKR2xQWTzr1+vvGGcb5CKSM8OEO/ufPOckMj15lqDjFtM0Q9LzZG22/Ki6Fzi/Qs4OfI1oXe7oY5hhfM9S++YQvJN/oXzXkI4qBWi8CzM8aZYk9DkDCxFLDM71S1Mm8t975VbPbft3fcw/uOhAlXyIpoptE4GEHYAbAruR1RjEZyvh4sHqrP4KqkPU0LUzv1bBA93Sb/LGuWxHirplBqeUQwilwDrtr67Fr1KYS14MF1+8bia5tJu1S45XVC/tagNMAYUkEnAogE3QD4fVB7WItk/qwLP7fgSYBSaGVP7BitmcFK1Xn7mm947UB0pu4fYAk98kjufvwuBD0ZbtBsMqur3uj2iDajp6MshCAA8GbuFgJeUhCYw77JOhIa9EYY39747XoUH3JI06vDOG6zEHnkoaXNkc10UYKv8ndLSTPUqr/ZyZ6+ckCsdVZisVln1s0dbqVZHioMXnBiUFhw+s+kKyOUrd59hN0kQK0/7RJ9vKAqTz3u6cPM7tNu6SH4hkpfmD8hjircDTxx7nkWRM6IYmwqfCB0PGzij20y2OxLeEwUC6tWJyIlpxKdqoQAAD+1yvlRXr/+NP/0R/25dRP/+Ei/n//ffK/N2yzssDkl2Ob5fPMMUs3uBiiJ2GawgSgSEN4FjK2GudqXlw4mLukkp6mqTbd1nrmecBtlxqlq7nWlV3yNy5ag1wkgmOZZR9/Penn/Ts5dB748Y/sRNsAMRbp86Ax5HkzubAyQAwl9GiIpMHakZLG4b5w6h3WVuB0hGd7XslRR149RRuRsq2arRa/ageKR3esugFmw8fCKHwZPQU9EDCBZQR8A4IV+SAc1IZGv754D/wHtC+PXH0frZQbkL1rrprakfWR/KfeNtfbtGTfvTYExRi3+ZmWu7ogsIDFIPxVR8loiJQpNY8TnNIOeljE0WZpYZ9rRE4lSz+0UtZkZWsgSx6r5JAxR7uQUQ6ZkvhIncz5Ff4uXqXhtdmqIBWk36vgCw69Lr7JOditfbcOBR6q8CdLjt4hdElAJBedIC7WdzevngvnpZGi9ORb11/Sr/YlUjWRvDvY5qsFEKiaCvrXMMZ+/6InQXxJv8nof9RfalR2kqF9VdHHqC6tYczZ3ut+F7DPA7EFYTQi7PmZ/FqAbXM7Xjvz7Rgp8dvI99IV4/WK4pnDPeeZTTX/Mmiyt9QdBSQwoCjr7Xl3GWcr7sLPMAcxo/ZNzZb3qBzuDjtY5c03q4e2z9yGvsi1IiQM3WaO9cBZ70Bc9/O/H+hFU1R7q+wkzAhBTWJ5By7NYowPKPN0bcL5BXovQD3fvDRTqOyBGLjDNu4hxH7UAozCRkBZHZpgocAYHadPnC8BHoPfuvjH+bcUWxsKJhspvkJrMNu5Zu4gI7ZqnHFr7N/zOm7tvI9eMbdAYmxx0/nb7WjvW+Mqs3hq/6OqVgoexfhdkQ25s/VAhcc0Prrl+KG9M696+AS/7HoR+cL+CY22++Gg62O3sRK4K2kBLzMXbrjUY4EPobKTMXJbvkfcSC+N1Qe2h05qRxKo3RKXtmxL7u7hcOoliJ9LhdJQn+8hBv4lbhcfUjvB5brqNZeB7LpMYRB8dpshMunlS6KmXCDiA1ZBu440DFuW1xrzd8K1jSwvBtMB/UiXGuEKbSStH4ZgEAfRFu4CCgS3oDuxR1cZezao5aJRICx7rSy3F2VT/TwmGkHlXMwXg46M8JR38stajRMA/oBLSJ8pzVXAmnCWYF43IcPFFl15bHuCNTuc6GBNZT3f6260JS3KHoaP1XFeJAn5YRLEDRqXDYCrexuxmszFrTCTxaQgpPLqL8p89hpYcbHabHaEBiraMbH/mHnE/4J05PFDRCidXq5TXPolURn/GwvcebWXdSn7VNC+XP7NlMH/M7XgZ9tGRoPrgDCzCZNILwzQ3Y2UPgyymwwVDIDe+c0LoWT3TqtTYHhan/ZzPIjsmAdSUagQxQC2henwGMjPZNOq0ZmVpgp/skXpNEQF19K0b0y5mfwuhlL8BD72frbUHdWUqKuG7rZOl5TSEyX4S751/49E651gvgvce5caAjG6MuLp9GqvwZ6ND3XkV4hGDn7To5SskwWNrTecUthK2lb7eNoEzBV4/gjAfb2X40ALefQQQ/skAQF4cMG8+/rl9PK2BtHuMcHJp4a+SRteYNkpxxhbjrJr1bO6a4DauQi2IOZX8eA2emhxZJMqj/d1ebb1cUJnpnoMAwotOJd2jyXMOb9mEbsSOXbRPQ5Vz7NxTeNAI31cpCb6GfHeorT883/ff8NC2LIcpZxHEa0or0FrjRIsEW0gm3H7mIEIC3Al4xaEymY4/6zJ7U3d9cHV7tnotwVeiO4tEu0MZHw5zJiT0FfvARHZ+jzS08vcN6IFHx7rr+ma1UVmr23HphHY833T4ApBurUrpGlBRZEu4cySFARvL/OTAdwOOrAl9TLk91JZ6T5R7PKF0NBcQZScfizHm+SyBP1MBAABijD9OuM7fh/euXnRhnwfsw3YrRUq0UGCOi1DwSd8xAAGVbVEnj0lV+C6/dW98paDwJxujE5eKw4SBq+ZOpWAoxj333sdmRhua8A7SBPdyvnlfvz8xFtR9NiXlhubdB/7r/hfBbsneoqePs+tAu6yKarn6C9v2qaXezbt0hSqcYJSbHZmFRil1ZkedKA3FvJkEKlWRd7lsbtbZ/Cl/hZHUO2//N2j4gL7UBGvECa3IFeYm6mxOogWH6+240r4FKffz0wOUNhQ4gCL3iiZjYGIWAZuhoFQDK+Yc4AcDud2LbA3ii9CCQKs0l8XaC4NBwntb7nlfsCLoKhAHvRj1aG36ygZ0Y0AQnTnFEKR6awBA/vbmwFv4ecFpVO0OtlEvSddtZqvlRMvrOpqScpMtmtg96UXJtynZ5NkaJCoRhrQSntaFXqCFKVI1BBBjteXWaTjBt/bvGGdyHc74iO6q/q+aKVdKK2cjd887pxZCqMGXp/u8kvdYFG4hXTKA/9Me+ARXA9hkk6I2WyPtX4ZfZ0o9zTssBidWsirLK5y3zJ2/j69ha3p+qoijvUN2DLbdM2ox7ruOK2GqXuDaSUZZ28RJtPleHFf2byv9YulcT3z1MqvQbapkfZchVoqpIfNgHFSTMh8CbZyJkjRUZWhRHFil+2vBHNiLz3PotyXpxLNYwP8HfSXr80Pz/wV+5a9lr45QttEaIBtHi9wpCaUaDkYjvKF1C9QVAofC4K+etQWFfhvjvYB8ckikklDZO39X1m6/ngjRhfhOeq6Xov1HQ3yPxZ0hCmkyZzWa8YRgRmXyNVxnn2v2MsPYlp5hsR4qlHwajFt707AwgFsg2o3rGYQQqS1VfUkEJ/1Jng5TBleEdHA7A0tkm2BODvrbI+2j7KoemL10vFpQH0jI9ov4euNL/y0lBW63xmCwIUSnQ2i+xyGW3gPRmVGRkHlFR3uCcK1QGPkOnEY6KHb+RyGMIm+PkNTu2IhZxb/oZWVz3EZx2CMR43HRLtEdY/hMk19QysyTocopxn0pjAdcB4SHFLGvQj8Fi/nIiF2LDfNmU2M9YyFX+8CYxXyRSBSwy6ejWU1y3aAz8Wmu7AxsQ3q9ALz3tUzCumcl5ylYZgA5hqGJjSl1mG039XWHFcBL/P4ZgXbB6Gebj+guhcvLRbZnzvCuld41PX9Nfds+qw33oum5Sc6UsDSqAQIdyMkfM924i2UotuwgMxG7KsvNt0+ygQhpcybq1rajt2VsYW+vmKM5ZQwFrt1PBrigJvSit5noE6Y7IxnjUzxZfaN3NB+67gfr2IwnFNLPCzE35LZZqc+pxqQ2QmlGlu+lvYTLC9emNxpd2OojMkkhnzaP1FtH5UhpXueZkTucmY9Y6ahRHpMQp41/jWW5W62KUu9gOr4ZKDH72HP+P5WcoKCbHKCuX8EvYm7nJs+ihkQUe9QlFsyeqLHmOy5FpvJopWQ50z7CqcSu+y9eW793Qz6LcahUZdbQspJT6tsLpM3foWziS9xXe3Vbfj6UX8PP5OKnFPpG1vDDLENywPtcVLekmToMRjfEDCqazI1MS0liIHEE32hkqZYe2Zx4vvtfed3wD7m97D8gV8kGkkrCyISePlrrV4GUOG1P92giIhS9PfCLWZ8adYuxZO87gj3N+O2q/PgmVMgU06NqiC2JBHK74NbJn2S+qLq4HemoQmNUMIlkXhbjijlL425icE2UqjvzQtUxqc9OyHTg7mSx5gKGKOB4Bh/xM7U5e3ktq6Kk959XZAlTC6H+Cuamo7Qo+vCo1wFet7Jo3MwiMV2ep9VrmmqAQyqn1Z8d09TzahJWwOojCNeADIRLzguZFouheXgSFO3TdegrmYwPtRD0p+rEC6lm/E09ZFKJX8oeBfWO29THD57KIPBScoW+MGoC4I2ADxDm/XtUwIUxQiwyReEjtVo4uNYytmqAWOcWKny+Dil/6vDnC6XN0UeFlI9mrQO9+vQAfsYcoJ0u0lhyL9IUZj4i4BnwYtva8ihTRWBL4nUIK8Ohd2mqQjsF58x11JNC/53cxiFRi+//ZD8cesHduGX/7Jo9Gs1/xdOBCQPkye+KlvkK3izNSQuJ5P7AwoD2P1bi6E2YXY6IOqIfB9vfw/vJufU4rEZ7M4Px6Eu9OeHAmXibHky/mEFn6fHtWjtIxJvclvvthWTsiTBqSDBSzlIbvmPJ+YCiuH12qMqM5MAyJPF9ZYxcASphrSUW0/J4Aak09G7IpSZB2yNm4ELsgDl6mLUVdNw6X/7bgtFeWlY0tsQC64CzKG5VQl6PmUAQ1oc2OOWe9vpHhqG9XISTyAze7BgNYA4SWr0WivZmL1mJT/C8Rn5ZtPusHsCZyfZR90ZQfXvW4szKWSax4JBZh9OBY3eAGINTZW3ZybhR+U9TXjQMKxL664F49I50a0Dg5GaUSodHfEFjwEgjgGu00RZfqgAB9q/5xtZQ4O02sI9Z3MfHlgtj+6XMhHoWzFo78t49qMxQXElm18qs7m6WzgZ7xskiHNZqkxi3eT9azX/2vnZqGBS40EiBTxSD/u4BdZ2Qrjltp7aVkIkDurELr9xtjSO+ikrkdlqbHwhtDuB6wN0WRJs4t88NVQADgz9qseGtt0PFCq41Lwppt8s84W1ZySt1dD99WShjF3uVm0VNmj1HZ1e8AqguDt74BjApGAW6WYTcc/iYk7uz+3YhF7ypkwJb6/USeuFml9sK3cjWbr6dthwAp/pp6IRBMJfwU9wji4qkkLy55/iaT9u3f34fqNm5sT4RC6hx9lf1fNITLHScg3lgYQ7ugthlmN1cwYpuhK39x8+S8/hrMvF66BLdHz7Theec9b9raKErD9AdNvLCWsyDLKH8ALn+1rEuMU52ceXt8YlVowfpE1GTrLbFl+qf2nePmQinW/L3EAetEwjbP85iq3whyvwVM1m480UWa0NVuzm2Eh14lzR6p2jtkwEq0az6CaDYq3fN5tu/fhza21qQk4wL1PnDjobaGMfo6J9dC2fYQZ+Cpw0noalv6y1XDlggrSBxpauKMmGrHPcr7n0XExlTg5/XADMxxPXiOJ0DL7FuYJ033L/65BzSd3UEPGV+bqEUremmEFjo590qQ+09H3PGZU4kcp9lG52SvU/ar0b9E/Sldp5Zv6RF0oXUVO3dEw28xI9PoLLFtxW601EMWZ0klqy87/UuJHeotCeRYIfVxg0lkpKXWKdtv1v73HzMBC9Xxaik8TVdVjrmHcceVoimf/k72ucMxN7Eiv/5dzZUm2oDg0LTn9IVIMuHsF49fuRzWpE0tiVTIfGD/2dPM6Wv9NLLCELRcq3Hn2AIzlx4OIYjm/d26DmuG9pQoeVl4Ht7K+pYXwzXFUFiZBvZ8c5Js2vgs1WySMyfJ8b4t91HnHGWWy02pxifx5+fdgG659w0sv0WYFH5ZRdbXvFyz5wL0yq/ZHQZrRY7PCiHW4lMnaNX/Hhq42ycUlPH+eAvYNQkZ/0VUd2sTqmR4BARUKUgCm/+VmeWkbU8yaqp2d1e0Tk02ILBsa9KvBR/YXyNI0mqdfXMJgxbxVgaJbY06EAPAVgOal8LOw0FH2zlwOxdhSncfpCkLxnjJntNGk3o+zna34evhKo3VSrVnOWNcSKawb0Pbt5OUs2wMaMDqviTGDnHwvmyMxsxj9gqqM+PsznfVcXZ0a38Z6QpDMULVDwpdcOUXNnB1Re45SRaEeniZio/rVWP9sLnVMWS/6/s8lXAkWsVVVpHY+WFuEDfdJdnWmluMGzLN+G4dz4YxweGBdLPUtgpvt3GNHBf5rIxsaON3QtSsptGPzDRmD06vdrxBkatKkTbX+UJF0CEyZmTljFIQfuHxURFAOPROEhsoLbh+or9W7+3F49nIlXQR3/MZnk+13R2tGu/+EcK3it1yeOa6wNch4HpNvt8zZaWwRk+LzNRSY4VXqgi3dMrb5f5cuFAo9DMxWljN/M23Ur2s1z/AMsv4lNH2DzuowPvjNXwUTCkfNm1jy7SGtdwEKDzr28GAX361h8no0Pa2GDbZtG0q2AUnWBPyGL3LY/TWmlmq65G9doh+pRSh13CzWvUowkzd65B0f3EVFlKhwezZF5Fs/hYtVXGwOgBjx3Ve4FCqXXA/DYG4+igNakpIkw+HR6EcxKu1p2xTjuSKCAw8fZT2U7Ty1844JbpzTnuq1h8yX6RKcDtul7Ce6UWqEmF91cDDw/hbdBLf+6yXorduif/WOkQ6AakanCKGX4PX0jtFd+gI5aqJHQ7zjPRmOAuZpczE4aLZRSfTqgzlNHsApxKR+elwWQv4+qUwrKgKIk6Of/m4BMI0w9gBGNgVmINkPqoKXlTDLvK36LoetZPyXXMSjUSILUOH+wzYnCvJQj4i2I6tCzmKT48mTrdJHdWt+FgZN+y2/9PVRvc8HP+ELO2mcezZ4wP15w6PckAyuF/N5w3Jy1tnHz0J1e0F+dRlvNm1FUktfwsUf6NaWhiUGN465e+XhH/TfmxJjcpauYL5E1dag3yJvLIXQ0CB3/RJ11g2CzNHBXZwhwsjrHeapgSM2gX7qlYipyTdYVGQq6CkE2UZDJBMywmRbhYz9SqwA2ieV9oQINlOQ3aUvhudgyrRd6Xp6vIel1/McQ2+UXWjL291QyjOCXc9nb79bxdUqJjvaw7GFIrEvSLxYSew1ILoMI+F5IwTcn763y7/KQnlqEFQICYIDz5e5Y3L1cd4YnHnZ66g22AIBX/t3zBaD9cdXKr3Xyu3OVvnffboQnaapz9CPzqPTvwxuYFLyQ2u1Xj11Cvvtrgov1K2R2UB9tSeDnKCkIGABtB1oywpOcYzhQXwWJLFoQrX8oYorjepFZ9KIM8iRPWkfO4n3gTcp4mXnE+C5QPPr6PHg0tspwPRTOk++aoJk8qwT4fd9D8hp068y7PH72dQchMpdNg9lL0AcwMSwzHC3DsEE1eOke4dT6Y+LzEulP5ImEwuz0d6HA+FNbWMqKufBsuaGt1JnlrgKpr64YvFPHlYh3Woj0AZZcQshRdeagGcqPl4G3ogcRTMpvp8exfGIyXuPXbEfHRUS2sM3x8sFodEChqNukMqiSpzLSKXyAKzjBJaoj8uVCFsknNRkvqEWSCjQnP/QzUhj/2WZrd8VscQzT3A3vfeLWT5ieam1EWulxVJpUL+uQT4xmsn9LPZPGLjhzX+Bs4ZtDBZKnGEohdhmEhsyBH3F0NrWVP0JfezsOPbSXEUrridIh454695Hxe6sq3dP2hJR+9tBJT0pOx9JNtcGpcloeJyyG5qBipIzHpPAYbL+qUeYJ9OPWVQDyCeGlCX5t6RhQVG5NAba9Bm7Qf3+qR+Lx/WJlh1pE0e3Zb7QQq0F1+v6FR1kKEqRn/ODmCQb06ERSdjgWL3BXIjMmgr7QiUxJKJ/8aLCc3kQ2WP7Kio6vh4S59Z1oiI75QdFeuk4LzJAg0kmREPaviPXMFjruKaQIAWyoaoqMhKSoTR4x3d9qdyjNJR2I6KIWNuzhCTSDYYwkXlOtZ/YCM3crDNp2OXe9PTZS1k/BXPxAYnkijn/PzMOwctaXErxpsDAp4BsW2TScnGMMdERiC1x0fpiMErygQyOWTzEHOuU88rKO+ZNl7AU4EkLAOuNxjPaDrj+ZSZI0u+ukK/TZiarJ5VuMgOqow6IrfM5KqOfEgq87JtujZ8/qv5P/29fbxOp8xFPLKjHWbJKKiVa5FFWg/Bj825CsPN5+9uzoG64ow2vsHblhvuhQBzFxVV65+aAgNUfLnJEbGJ2woAvvffJJXWyqBlDTvpBbo7Lcp1PPIHxjQP1XQzvy0iCxnWBSyV+eYRHbNS+3gK1aPUQ0z0hHNw71rSBOpMZg/tNR6LoUAo3mjtJGFQZ5zODP6dbW/UidRVk3Z5Nhey7x3/DL6t2Bv+56Tm0b6F2Y0U1cVIZ5ekuGtl5L0kn7wApNRewgxF6yYbmBft3m+0m/9piJrlT9OFFmdSpz6KvAVeFL4pIi751g0Ak0+zHtJMbBHoJZPdk4o5BiLW9MUpmqyqLGbr1nKuegWTL5cFCzB7x9VWj/VqujjA8QKyJBqOm7lqvkSF6w5CDgSfx9MtErWGoMyYvaoMpfMdmPP8jNBI3++5XBk2wAmaqIZc6zuzOeEns6Qt7z2reiDEXZgo66f+/xDBhwBPxG8P80rzkl2BNHAz/dU4BDn/eUiHf6FdKN0u+bLwFFDr6K+iT78J/b4OlXc56s4F24N/MIi+D5gGbMH2VPIUmAssRhAnfoSban0gu0+McdlE2HHOiVhV8lAvj9W8KfkABa8kSn4px7pHzJbzf47PmZ1+5UZ0vP8al2l5uNL3u8VIhG+3NsWb69VlzZ8huiPYnGxb4Nw2d3ns+vYc9hk1htCugKXCjn7HMwZaVCBBSCEuNKboM3txztj37TbIl22Pq4JaNOuS4jx1RCxXfYdkFWtuS1ZNZXSvSiW7cR7VaSezTpd0+ORHVDL8Wti9lE6wdII1MtRAI1Irf6oWeR6wunYmBbEyEvSJnNc42EakXt6ki/mE0DfAPoh6xk+VXaMEObQQw8ZJCkxN4ZwM3nT/oG9pV3zUk5qpuZIbhHdewMq4hK7nhOq+lslhcXJgbbfjjI75QmdkSIhZaiI/HwPtp+bROrvpWGK5UCWXJOWt6ZQ3LoBv2vemYI+DyDmc+bfxcnwtDIrwleG/EL/dkf9yGvEDZcMwBjsHCq+nhAcBbqWguGQdENlbShaqUT/3vz2NHvKNG9aGkfBrejNTbMUjfEVHVpef1oRYHLJ6yTbnBOugpQA145o7voiGnSFoH5xatue5i8d692KU6j4cEMqBcGsEhUepBMr5NcrbM8sry0YDws+TDfMdELro40Lsj6f5Fs3NxIU37dlGsI3ciMg7KGE6tGm5q8nik5NQ1iugPhXYLkllNRIWXuA2OqDH8m++24RcMxcbx44H7yqkQOX+qNNJwSkEw6r/jO5yudNkxC8saaiOopvt/+jNVpkbWF9tx+0Lhv6YNKuU+oDYIKlKCn1gjm7WLY8azuFoK/lic88md1ccZ2yj+138lgvOhDB5xBWTl4nXhuQ/xYUV5ZA4TbKFj8jxaWP+9160WBbomzhpqqoRG4sZQatx0Qn0MrFJ4Gd13Z8Rksc4nVVteC2ZqTDpazln0oXBCxo8jZUrCi7okfBGFCanJ4EuOGI9gMrPqcnT//Yt2w2wR6aA38D2vSRJ3djmdBSjtAcfdJZYpBXuRBpzIV3LPATiH4qyDE0pNvCvpKSrhjGvGpAd+lCjzzqpBhqEt+Ktv9wscefiedYkwKe6nFCflbvbLRPk5IVi9Ab4CPAGUV/K4TCPbxeNcdSfTcyyRamFDO9no78PgAgj0HcqxekP58pYZG4cKlsJCwhwvkLUreN9H8x+brXT8qwUbSzNJvzzmEk1ixkCtMoPKZQPp5hT1Ur5PcKUYyxbMLA7eiCsNlBfWrMRGNlP+XwtZHslcGbiqW0fM5mS1HhlqSMngYmCyJoZ9f1+WlTGL3X3V4PCyAY8PP+/Tdbtnaad2l22er0vIB9lGSx6nVEUhW8ocA9sFEdqyoV8hZsRi1NipA/gXceSfJ6o52Q3m2N/x8QvU92gSiCiZFqs/7Nxjg015mc3BQS/LnqwcBHGToowsIdgDGIAxqPs+DV1hxYPAfCaNyU2YzDmuIzI2WLfempqHpEKdXHVgF68/9K61wpvzWJmcvemEjMH3QqryFRfZl5fa2jjOShzZLjBUqstkwss5zAg2UjiSjbxz5NmFazenzT19CPlTGt+arsqHuSfQMyqJD9c0dVC4L93gUGNYmZiTEGw0P3SeaU58xn8n6Q6lDHEVzB69k4dat8/SrJ3poj/5Eolbno7mFqRb0HDbHaaYn87AY87RJuOvIwk9G0XJxNA2TqTTOoBbhkv4nzQpN2p4kN6sI5TQYEcV+GKyt/FHs5ehi9rJ+yjEImtnyUJ0LzrQ0edkBGtE8hFAX+yHDUEpz5AoAonLpn/4DonUr4yWnmO9Fx9tl6zUSE6dtm3AGS4pY15yoHtTwz35j0PwSAoriyE6dXR3u4ZbH2iAplgKEpfwnerVPstBV3eQloFQb76LMON/0tjC+G69jHCFe0E84CqDrYKq6+vF1dddNw2A+CcY9Sv4764NH5h7xMbCstn/3ZHWmLEJeaY8pU/2pGJSxYxvmjdXRJtiCliuWlxmF7aw2s71HJsjf8wfYXUKMWGSeqa1qzDmQ28dYBIsGvsOr/rQIT5u6rqnEuDcbEvKqghGEg0GA0VL/AxvUmnqHsnrEMQFgucbKApQGAfl6bigax45NDSgxEE6ItSSwp69I+p44abC+tM3KzYbnQZ8YRBFJdcSymbxB2M/LOV1Tmnt+kbKtrck9V3loq8rztpz9BEgKacVweC7Arc/C6HENWu6t3n2RDQ/7EvetEaQmgqpXVtXBQjHd5TLLtyrjZcaW/xrIHn9Z7Gh24xTmyIUzzGRSmlMuLceCJheH9j+soDaWoYyppVX2STFvLIctIKycQNmO4WJJymIo/RpSDX3QUmm63+0VW+o1vDj1LaMl9kB4Y3gCb6lAC/k1/XXr/oevc1DjINZ1dRaZRRv6y/eU+W3tXVkQKQFJXKaUCwvboBv7UrLs8hBskR/vrtJjZe/GvS/f9XRcQ5Py5N64TZvGrd0+6SknRzsx2nEumoQTE1mfULUhcuaWubbwmbmsR1oQbHU5gbYSdoO0J0cqyKfSHXR/w4nduxzD4McdOaEKlrPKmeOt+sj1AjTkmt4JDBL9KZo97zph/71EzRsNzGUxc5wfrnEVNlNdKvbUFlDHXPb5PjsKVVylmWU8aaUE+5a9R9HfwNYH5qj1W5NReKCdtKNde/PvvjxT4MzCv00dE7PqQax9N5mlYl7WR/dI4G3IJeKoGiqpJ7DBAPu9owRoMK5ep22N/p28sBn+A3OrreMdztX+Psi+ImhjRB/jRBl+IP7YM/2Ga5IgoRnZZDZZNWeGNlLUDhZcr8a4C8eJNLwQEExyyR7FSMqyNmSG30PMC6iq5FbImB80aIWqhSNwWTAtOzaNSPPG0KhNBSNvgL3RlniYgCVFtktg1iszPioTmAN/cU8WP7FjXmSakBdPvA8StrrpeVrFnv027gM1OcabWqTZiXT6aMEdczalUR6yoeLRl++LeEGYDSPHKjtuoJV+24pHArm4N79jAcOy44ytoT5JZZMremRT0S+6tQQawTfjXDkIc7YhOAvplBdVpDvmWeNiE9CgRtqQFzuQGhaFLcI0OjqKQnGmVJFXteLCaJkt4WV0WAYXaaMZGznviwP+25/UdHHN8z8k32A+1me1sNuHC8kzxGoYjDUnawqfQ9tbrzBnLSmTaYqgzCLfcQ+GzR10aC5tYpcQWof5OsEDa33bFVy+STbd2kaJ7NOB6Va/4Wh8g9mtJrKRY7Ga1ci+fIxC6shQRLSPfiII6xoVt1lQOe10EOYovKpOqWDoEcLMsTzSO0lh0JpyQbTP4wTKSDvONsgrPuLtzlZ5LkqEyYH4UxRB7bR1yOuk0oFAJnwR50UtqebeGt27pWbkPjeZH5gKYGgsSqlQhccjI7tAmnksDnjvtg8JKtoProczMVEkdfXjiZWUxaleEgaLORQB1TunOzMIIniRJto2Y9ObHkvOPW1AOhAOgDBnuVr/wYlv4cFnQYpVJ3yQv9kZbrBXLJxEbRfXz9tWdXo7Wq2+ZaoMzpyUg8htrNlB7EzCt1bd9uqSpGJXCMvdDmGnIiDWdatpI+X8mDj3sSHo37qsAu/lw/2cKvS9/LS1eAj39/JXAWbRde6qOV+1uQ1O8I5T5fAruGslQKrthwDnNFpsB0O38vCkpLYa+r4dCKwb7BpGdmUPBifuYSf/EvTFCZ4cjMTYRHgOsWqCEMW+0PIKkKvXDtzl/fLthmsXtjGbiQdR85xoIYkujHlVJWAKPhz1GEc7USZpLq7wOzbX701k17TA4n6NElDpa2sy+HTcKicIzywe9sGkvTxNUzd0zUE8Wt02ZvL55qn9nyk7EORyxkoo3cNW2AubfrrD0mbCot3PCcN/bM8AzYS5spCaqzAxrKIGcsNX5DQvmWf+ewIKO5eEh3qcwJDHHXPc6C0/o35/GKwoRrfeIjIch/nZH8zb3h9veaCr+QUCPEX6hoJ16ypSKa005oHXBEdgedmdJSv2gS75VioMf5fjC/9sSX3Ed2DqBiowOMHNWk/xxy1QwSSJAmNIQa0vWYYn8qdfW4ClxYcubfUaM5g9DHtJ+T/oX5ytEIHllDlbUxN0EXs906MbwDyM0XWNKXy5tA6BTyrI+zxL8gEeULmnwwVwzAvN2jqGKyg+aJHcN3W3Xz++QRhfLw8ifljLrIcr60yCj7/ei6bRbOr9if5JUQGnfjGb1xIztPauQpxRR3Fou2qMU0Ewqe1PYDIi8K5IBJ/0JAB0jyyE8ZlDccGmZVn2g4TVH3KDUofapmq9SMW2MVIksqmRf55PUPBu/JzyJWuUtRUTW2jrNkamQW00KE6onG+mcWeeSIlAAGITgvQEpC9Q1ObnlEeC1yAbgujlaUujlDD/IeQs4xfW/HfWDwfIgaprAVgTS/D34ghItSuEqykvgsiQZRhXU6RwYpm11p4EYKPHVNRCU1ykl+Y9u77fEl7IZd0sQZQOpq57I7vKfFv60ga6hpBOJ0wd8BMk/AKsPUoOff4Iod0JhtJ1YpBnWIIakFmW41a6ECya8RfXKuJN66ropuycx9oDbsW4WdUCuagGpFTJMbbeifEcNbbNGsj5z2buK+qMzpevnQ/nvLH9b/B+GBpzozXIuaJyIn+vY7qH27ll4G4il7ymN76/HcCsVGdyIzFwP/F3KPFw7KrEwlLzDczZEifbY8NH47ERqJT9tXtLsQyGqrNMKazSEshd7HXKT2+8JHhBs+h9x7/0wBPXQmb0fVDSbT6vSaoJjmX8yz2vn1gihdVL7+jupFyNczbmtNm/H8md5tqA9qQN0eGevdx0peMnZMxOCIHTNbq3EJD2cNRhnv+F5YhC12nvG4bEKCDsm3Ud7dWlyPEsT6fJEfXLSLqKiuoEB5YX61O5lTPfG4QToCnKhrjqWBZ8orOvZV7dfKpb7LsVDFhfMLc7uA9R0dM6yN+0Su2ZLKXR2/cNwbxaIz4nW+s85y1WVJlHinl0WMwQmzbNNKomFJDtZxgQIl7Y1QUrQyKelMPpwW8cC6heVTV8hr9f4BFeyJ5NRX6b/PPk4pXWfndUgJ8Xw5VekHaXKKFjoXDkJCt9hkDwKuCGEOpfOLLqlPXklOlewbm7OzkF0Kf2ImbH+U8Rv58i+BkeYwFOXWNGt4Xz/VJ0gAu1KCbLFmBbgP1rTvulq+HLwNRmcexgUMmLhG3g5KtxzbAfGtGZTRYBjuC7b2VKxvdpjtSIQkmCSCA65ZGXga17Ly6tA3LqFSkkQVMfgGWtzd3a9sL5U66EK9NPDWta7UZxkA+pmZzn8RnBLWoO7E6CehZU+cGU9ufrdXKX2lPivzsuoAfcWMtI6ajPnvG9uClTL9zSVvYznsBRZ9FPD3MNWfLdWM0yWijM05HrQe8LUrSv+IqlegvKS6pdVufJsLQiao/o7B7WCFlcwxfW3baZ0ickEyF0vW/tpOHqpc1e0iKLaYb9/SeC3zNplodawKRPoPt/TL/ccLMp56j3M2qFPyQqkvfwmf9osoqyRqoz5RyKOomoI0BJHUcIETn3BnnTlgx+F7LSayhSdjJkXPle6HiUEAKk21GlXEvdMxKuFYnox3GjeW3XVJBqL/T05WqsA9A/9NIXOJ8KFdCxMcZQXr/DOTfs82IMRlqO9nt6jOQC5Sy46ZWvn+r2yIdbt9bGR7+7V5cM7VBrKr8czLg/HYCqsXM6HrNlbB7wzmqH0c/FH8Onxucf5Qy4RC+2ocbbeSOTNXDFCkLmXbxL3815621uX7++AgtI9t7USdoc1Dqrwvj1x8J0VZhB6NuFLv9nOKSEqhJk2FqiFW092fmWX5RXHigXC2F/0O/4ohyynPnowbHhD2fBepwNn09wDpsdUvsE9TtY/UTDplL6iEjBXTjB5jxgv+Wj6HbE3FBBFnkd5/enklZOYEdRiFcCs6A+oFxC9eUVPMgLtQtJcdRVdyPa5+qWk9zC8brucFP/wSVhFaZkvGjnTP/+Nf0pHG0Y9KdmtsaWzk+hmaJ2dgBNBRdl6XtFqHdeXZVHUGfIYbotFBzw/9qd1DCCkEaMpbY39NTR37htan7i599vsD0/MHWPEveDtd4RIZFvWz6zmqRPOfwb8hjBkNpHbBkt7sbIjMPy6yvBmfePyO7w5BziqKvVhrHsOuhhOrXtP6Z66ci7EZkYC7DUD1C+FwaZs6d1A8Ny4RsC7uixL3pBvQ2Inf9eLa4cr9KrlMc06MdG17JYBESNs5pjYCGEwni/5kXzrhhsib5iyA3m5GE4u6yoX2bdSshI4lh8SDIZpgA9pfvXe+Es6ZBe/dMAglPaFOnhSUlFGs+zoIsRZrAfDXyCYtON9BEc/CrssI8Hk2GjqB1wKN646uuBebf2VGANT+DzhbKHnQkpqRQ+Rr6P8FDX5X4+YfSoobkGyjmYhAb8wiK6jjJRX/vEjG8kAF7k2MO4VChrXkTyGTZwqqTykpm9d30e1vakhqYw67FSR7ycQdKpdsiQHiB7QNQuJmsmvmAnHCYzKME0JaNLXF3mvOYiRdt+n/MTmemUbXw8jiY/vlCa7WE40QEw3PXwHqbJKDZd0dizoxJKwBeX1hDYtyqLe1WgX6kADCxuMBxTuuKd4CXzh4dQ8UaHkUAYcAZiU1lQsR26ktzKl5p6lIiFyiP0rHE1Ptg42whlk+BhOc8Z53c7geUCcApcmFIt0ELAUkqYviw9qjF5/WJfnMAvu4irv/1CFOQJC6uBcv2orsDrge6Xq5Y2e+XI50AGuQ+//nuTntVK7wEKxSD8li/a4uGOS9C6NYOh5y6TRlW0EiLTGiPXWB3yGMuL3IOyPv0uh3gNgoMH40qUtxqVoLn2e43OtHZW3rCH5Z0jzzp2y8v5GojNNJiO3eiBM9oHzioGrQw/NDIq+2zeVAmhkyqOQf9PfNgim8XqT3XSIx0DwwZo57QSsz1AEnL9L/EKfVOOO3lvzDSaHXT0g0NyDCX1SxBj4IyPJ3bIDK3llpySUuktU0eGQfc6jzKdmB1GvG75tlXmIW4K0Of29v1qbyUcNHixdwEoTud3mHOZQvzWa3xZrDei1/kd3i2Jgt6O/8AiTxeiFGZ8IWVeAmckRlDrAsQ6VA0n6V1c8vnjZWLdA45HCOExrUNh3qrCfn0+UHdB8j86e2QQOPTY5i28qIIwY48HQnuZX9h4auehT73ak11kRa+WyuK8GZaLeEWCtRh/dkcSqjWQ8soDrpovvmTllJ9EwhunD0zy7rYP1+qKQpmmXHwVhl9OfoQfISyIfolmBNNxcCDGnP2LsCm/F+L4RthjYphNXPCY1FMvpUZIDTHUy2kwLyoCW7hvYFKkhXrk+c6YD5Dxrf1h1EADuV3YpqwAwgs2Qi5Bi3YJeGXxSo7/tIilTVD01xs7AihWdJkJ84jvnd+xMeSHe2C/M/n/w9svj81gJ0Jh9NdgaLuRGYqMZPHqLiCmE2mB1Hu05DYbCgd4U8A1qNVrxK0V/I0EsUHQ95Z+TvPjOcw1XmRRUuOPdUzmTytrC0yw5rLzUzAwyDs3jr5NCeQrxnLWyLYGq9bag+67pldGQI4yPb/pdtQcrrxrlAryOCarO801TtB7Nj4hCfx6XW3sHC4i6bIKirHhr2SKTvO446okFNUQOIPT1Jvzu02zH4vZuw0icn3E8ms/rGTib+DJU4W/pH3aC1F04ln4hnqJYr0S3fcHvE8EcB5V8melec0BAWMWccULzKrefiSVraOJbHNk93nqcvBxdx7Ixv6rbz/+gJIoa1KV4tS/ZT0CJY5Z1vJz4lKZXPKgGEri571c8W61VX61FtSGerT/R9hCz41X5p8Yycxe6Nz8F2pmsiEFR+kz4qj1/CFvKMHcY7znUa3oEa58dJGP29Svvqico6dQrAx3gg7tANyw8BArsw0+65rBB/gGk/nXzWSClbHofjqX8zQOZMTJmjODg7shvdMC+ediNvRc2duduQeW5zDl4Yv4zTaBMebPBSOR4hHPJQS7/RhJH/A8u8uaXAyudIU/1bxWMRl6L145VyNxweUP+1rKoXL9KzJ6c84NK8sZ0jD0k6Q++RvAPJKkqVUxYmElIKO7kW8uwFy1ROxfUXoJzuP2PXc60VaBxyoUnXS7267wzz0+gy/ExTl3G1FoK9t4TBZk7/2HmAoQjcSBa6qslSEREFhM50BOqPzT7HVn/SGML4qZ7WrhiLZz8jGSzFAKh6vEzbN3WUBL+ZkrMALlh0xNwmOTWNGQ1ILNdX3R5szejbStZaw3xxxNMkAcoRPUr8Ko+TnVaZVG946N8aHUWdStkIl6pKNbAZ135ZF4tPpvtKbxFbqqAt8pgYx+Iftin8f83/E5g7wIxfO6OvOdINgzU+lVOvuJhWIr1yqZTU0k4g0pEKYHo1dAjwBcP50WzxXLgjAFDG+dZVmAf/pP+Rv9CdeOOvWmVZKw8LCZjPw7ptcXY/gAJVR/l8wtYH9SKE8r4u3gguWfStoacT25GW+vtESNuSGg+euhqH82nD3akShMBj9x6M1nPvWKHjZsAmc08Wg+ILj/mzo8kOaX4gYapWpbyZocIhX95GZR1LYA8oEo6S87bU345YWFlzx20dZfwhizdPCmie2edxuapeSWp/TZ3jqH57zp3k8ghH4I4dyrR5E0IVu0dG6gYpE4Rlj976xwz+j/QKWFVdurTPf8C1wnAPdo5exm8AvkH97ZyP9nqEmiDQOiEW8Jyxx3kdwJxsBOdXQEqOi1Lpvc60cGs33MeCL5v6pOILtDTBDEtmpibd7E0h0NiPo8qeKbrf7k8NULFySomax0xWLDPTg5sSfvP3CymYXtXZdRC3cNBDKY7pLK3aHMJlOtPLNc9HkBylZyUzdOCfbkSjutRr/yh/kClRzI8i1N9VctKdfKuXGgC0VDv5nEeoyq4+ZLrXdr881XVLLzPCuzMekvB1pPqYv4zimJLVByIhFbfIGLBfjgpy5LaXdzA/wB+J68qthDWWrQ1UQ9Fj+1d8+R2sRO4rgPXZe44/dz5POungAYE3HmEVrmzdmE0SreQIuS+jTs9V0nt2QA9UpNQXftxaPg1BoxttXG4PqFaNXUwRymHtrRTwQgNqeZM1h9LhADJAymDnY6TvsS5xKiA5Q7IV4yqnCc9HG1FttfrbBZ+vQjisef/hhHAWTyblEZwweKqYTJz161LoQzdygkPTUxVqAzfMRuuMTqnsSf9EcOauNqZ+OmnDOwRiM7SACY+fBoiynH7odO9bfF6tTFiK2tFu0DUkEf540bWYVCga+yXM/AplssOEV9frfvqeFByQ4A0FuBOSOA7Mb/Rn69Pmift56SDjCVP6qBepGVmBtkMT4zFVf86EL2YgpxMt0LXJFkL+3nyf8aVR0Nol/sQiRq9KPj9ZZoY6UMaQDaBOS0vWdXhCLDk5W5h5+lg7fa0JEvy9LDhXtVwOq34UFybABWDxaan0RlrSFpRtdS8VE6sBSAnsrxH3ZQXdR2RNqbHxdjWxhspr5LfrYEP7KQ2pm7GNFPOa7GTBT5d09Zjcn8IJxbrlH2b9JeUZqYV7Z4acRiwoGmOiXZU5CxOjHkOICa5ZM3hYuV0ASpmwYiXVSCJb/K/Eytt1xE/rvy81v8o5W75QZY4UiiH5NnD06Jf4tDIyHaSNJq76cuWaMBbWuj/4tQviAAafNO82RCQ0HsfBH+HrnazxcVZfGKgdXaZG5kaL3wVpWy/GxE7e9gjm4AQsGwsZHRpB68Aow7t+jqRRNcamEA5JlIasKM+e/7QHlMcI6T9kwnWAfOpN9dOqoLvTWPyrbG3F+40cuvJqbGHgLrJbv1SROQS/Nhl8NxOzs6UmwtRGzE2pWfVIY/a80rB/cVe7fRwbEtX5Y7Q2C0JsIOSvfzvg4fj+vhWQThE5GUbxdNr3ADLVuVmlnkHMQChNgn45mUG3NRmsYtUA0aW8VxMILbNNh52taVb1eITGKgsHUslgBC99qjSKur/PGbIe1kkGBO3qXWK0sn0Ov6mPrt9JsvD3J7DUcXLA6R7tJ/1A4EqQ0DuFRwkXYnSn6F/vNDO/W0ltjSWX1jGqeg4ZWYH683sjJ4noMYwioSf/DfAB4G713s/7Xa61K5AtdrtWODuPZDZdNm9tjanBkmBJ8RMB6puDSbm15PMEMy2V+stAibqMzzLR6w89qgox/UtaxZlVuNYOfAqSkGPM0ruoH2NHQVXeGXBjBOhhY08NNZbtq9hhG0ic3478QC51wsRaeP3hZbu5WKNNctHHVl5eypFoAs3HHCJ3Qtoz80FaaxdIM79H5z00bxJuhWZkPmKBwAaR6txy2UvFNF645l1uK1QzVRUDBdKxLsCXRTB+T9hmcc8JIScekY5L5KGQHduP5jll0xjruKhxFupg8jGZAJn8N421KTQcKiT/zpLp9g+LgKVmKlw58UUSFsrmBG7emhinGvrH7M5bmHSzY2Tajr16lGqm2eVj2VQpEGgxwUG3FpyJEw0CUKjGQFUnh4BWFnJBAKU1SBWjuS5I7B3sTiKSUZFOYwyhRYG+yzX6HVVpH6EciyumsQneMxOxDy/5KZnwWtJM03wUz8xOLko2shguAW8QQsfV8cC/GubHYvWn6DtkZQ/+kIo9FdYcLjcQOJsmDKV0cTAaBUSzVeHKmcdIkS9pC6D5y217YuvKiDDhbahhLj5jDbaYzSazI+9MGH7hNfamaEm3aS1KIzi5bmo2rdGBQCkmb3N82ws1C8zpfd5O95JZGf2S97ZVMpQ76pZqc074+G+mxZxCUKl37uI2axY4Sr4eJVKegbtRcaUUilGb/UGWdtHO2oxWfY4YxJgf5oLSR6qitGA5rchtaNXyLYDQ8OSWtRRsRgLeB6LK99RBvgRGVJrdJXFqbbl8IJAn6AFoRXVmVctdvDZBvMDHcbTRw263seoJRBnEERifLyGi4LG8Pwu3n7ZGSOsPjgUuEZJvWpjokpkYdGM/t2uJ2/TPRPMPCnBdRfhS5xNEcplnnGJtDmnjndN73x0mY/48mb/Rk1VVu1w6eGIYovhAouziycy7gmzuHKAPcTkt7ipelI6q6fVcrbIYjeZcT96xi5wvPYyJJTQ3kZ4DvC/UVf1z8zrY209FiSGfgKfm47nuoozggCOCXklKFqNtIRgBKdU1C21GhU4mhFLsX8fbLZ5G/ioXcJfjQE/S6qdlDLrANGsFy1dvZ0rZ/43NJv3X56RXrVBIS8JuSLqId8niYsjV3M7G/bkd28NfvRC5MuyYlNiNn8viWZGJ44agSOHTMkFNvkIw0U9sSvDA1KeaY0prMHqt+3mBTPoVDbpOdZ+7Diho7VoF1r5wCn2/kOXZ1pxmXsv5n+IaQnKiwE5gX//gSi0NPWCFG3dALz+iR/Q4g/AioS//4Ef+vBKImScyfJnBubfRXfHRH42GosSw1n5ZgFiBTG6CnjXxqMxnThkgVxhbhhXoVr+QEdMWFX4cdKKjIeLqVC+zOLbfopZIhjgMDfLueX9vXW2O3SvBmr/O0bm6pckb70nxvZNmv7/ZmTS+fR5jHqlZGM9lYQOV2d0R4ieUPYPdUa8Pt4SerN+4wk9POqOLKW5q6Ku2DO/N/EC6qLV5oAo74ZRlI+krBRBd71D5l9fj08/oJdYoIJkOxz7KFxBdm/0ywTWWP43wwrYuOzFanudjClg01TRXORUPcSyNCaA0q98Qx0N6bW0lxr108OInoMNN5jBKs2FBix/leBvnXcHpySbtdsvfQhp+6UFvYmVfAhkMXMNUGc928mPzWwNw50LkGhT35ItMledfoCILBkOYIl6tQebrJ0xi8idykwcq1rXpdEgoeQjxbm2M0WExxYbC22O2Qi17spGuu3Ojn6wKAA7D8wV5dMbDZcU/dGNfydFflRwb3IPohfbyWOR9JrWrWExHBXSdkffqpbSk2UTDZuECzCJLkT4NFocT0UZ6TJF/It1xoKvKovdKgcr+bsGg0VDo8Nkde1Inf/pu9b5m+SJbX7dyKuGEAuEBKtz8QuCetV/8pa8dxcjLUzecSUxI5KgQ44YSehQm4IkMu6yebbYS+nrcBKSxeUlX3mcsXqiljDue9v7bjXeYcsPslG3ykoSQLOp3lbxiTUOS8qDOcoiaK0cE2Vv4kk3FH9OkCTbRxsUKddtkau7MkQfJrL33k8SRQpnThYXu1OlwwWIyozSJm92if8Xt5l29maofg1X3uEV6yTcnwOA4gu8wFIV1CDdbP5AU6P0NIfKMmDZ8e4gx1IhGUlkRdMTiP2HS9g6j9rEEFnjxZYXaoks0NWn/7VaNQgMwJG9VTgyHiHuCzNNsRKFmudBONdreX+Zz2fzmUoT7dWXe24YXurqY6/DxOpVSXajkUrByrokF+E/P/G/lOZMBpKwsN0EnCBBhYUfSj33w9YI0WWxz2lM48+gBk06dp15fDF78hZxBFglwvVzwT5x79cJNlS7f2LBuyzXlSr3kKF9agaq2dj6BwIyOe2fVc1o74qYZhz/fGrfFtbh3wZjmDnjBHWI2r9wklDKu2zcJxbICi8HlYQl7J7HcRn/TiiaZyzTyJzTljJbmeb3b81kRYw4ruaHi257dFLshePIJFlBQiwMFsSY6xsdjsSK20Ov0gRJmCoRFSACB7qrKgBXn8QpDzqtvE9yQ3Vfr57wzmXgkBzm7UPZutBRmbmRBhiLnrWQ/+1UNHKMwLretB7VVWEVwQ1hDY75b82jyON+8HRYPPTufCueSS4zJSjCM/L+C3CbCT73seNLpTdovhIpNzRCV5dTyamAzadnDa4W9NkahqHWMN9kk/wVV7JnUy5Ktx//x3dqjbvik/WqqeIWj8A8MFgRUSfpA+WknRf/Eo2afBnaVYE/I9rH4qhoHR00v29XX98iLhEFUeJqYAfX0t1o2Ae4Fg+08Z8L/FziZK6K/zqvTrluosrnhnJx2zeBwHN9p+D3zA4H8FUnjdKi2DsqYDaSRvCtwJDYIa8K25SlHg/L3Ql0WS2wGLTeLHvxVmtWMUeIMiLqeL2f7oYmcQVJiflkhDt7FBRsldnbsEfZYZD7vOb+yfb/euS1I6yLv5ZFxauz7k2IfdJm2XVXYJs5+/57cEw4FA+APAM3W9J57JidRsh+g48ivrXhbHlGmRKYuchUYbinErbut/qNc6AVjJRkqLu+aSXbZ92jaC66MugK5d+Y+aYHydUp2IO2hL5MZTvVy9QespRGPu3m0fGtmAQ9gIF2md1yK27fCyrtOOm8taYAS5YK2e6PrPU8nMSzjeEPkPyaiPpmhpu9A6lTJsAx8UYpVs5rxgAjePBXKI0rkAbUYHTOptnG3QOmy7Lhtdo7B9P64Ds2QkRhcgE+5wsJm//RWawuN3Daa4ENNLzAPsSP5fYqQcUsfcrCYRUpcfHIfv8PbjRDbvr6sLxempWxic6TeAwFvTSnpXnWATYPbSlYmt9qOTZPzqM5Rv/GI/i3NWxBrO4HE0B7Zyy805fWJhbqxgV9HAr3pHsO0favAeYNRiyQbZhWBR+nIaoyV1Qxm73qzvCLsDlV1/A49GThtX+i3h1yjGHtVFseIc1/OB5IuJlzmKuBcXENisbUgsXbgWtf0KIC46ot/h5w4LxAkNwbc36eSKbQCG8eNFozCWFlKJCyQjGzofJBx21nxLLhXseLw/H+0FzSzF3Xl+OfUa0NvJtTs804wRZ3mpjghpP+hmHV65bhVmZwyWiurAfa8as7KGOzLdyYefIg3ewEVTlaaYbEwEwcozB+PAlE7xPNPQk7U+26sfGBo/1CqBqN7cqQm5q2WjUb3AX3IFOZPY1PyhtM85uzsGcXCuVld2NolFf07yd4MmEqh+sH9GGrwTUOZHaR3fv19Nl8/8frDbPSxuceo+o8ASSIRKP5rXAeJOS4JjYWlaSmOdVqtOgDb2vUZWS+19qA1GmbpwM9EtYUoQfSLcDInIVFNRvnaUFuzKAZDYLTIYGINzA92s1tNUzxMTApwe82kuFhxbQvkNGg2q4GadrkBw50xpeb2Ew8o70OnsIJp/FfXPl8GWQbX7Ig+SVFvWW+OB5k0JhUob6PTxP9zVklAKiSTbuR7+2VE9EV9pcFFrvC4QcZJ/KTd8ETqGv1ZhxayiI/59RG+ZFVr8VvTAFs9XvwGu9EAGb/YfnKw5FvdDSj4qsLR3dtyS9d3cqGqjnFIbJe6Op4l29tO+oSVOFjCvoRG1nDhVd6f8SVwkUQoEQlcM2NWYfZCRX5e8ka//8hENTXx4hodvu6SgGm/5eka0aEn7P7Wvv9OaQYw5rQVLF/VKVQz6nJWBTQ4m9NxjxajzYKiJ4Wo0ELEyS8Wuzo4wIVT40N2czgwbAwrkHjZXD/4VYtjDxBsEJSfaApOgTmvmQMzJJefGfWIScfB7a0IrdLPWEMMIopDxi8XeBo5nucMFh2u8YQglik71Uv11JxeufHNUEYltiP2dEtqs56O/RM6dTAVl2Vq1rIE3NVgZyxpVH6gmffsiAHB/wYfhxq0KdXPB7uklSe39FtpZa0n9FpCQFeGWCRqMY1Zk3jci4hpbjWpcYdRMU7p+yyZhQaXDmOVDKworhfD2gJ9q46uOEL2iRXfBXGtYUrFu8+SblR2aH7jgHCOGKBXData0aaDAitxeDfSOrfQ4eu+YS+kKM3k3EVqezO+yON6hMI19eky7Wms1mUMw71hSw/Oyucw52yBaHIHSlM+PKK/m+VQkxRR6gkhvBGobpCFnLDmxZ6NX6O+WObi0rW+aKsjU5gYE4CwIR65dxVeo2a3UbC2yW5bJ0a1BRu7w/20luz9mLBm7pboO6rDb1m61wyPkjRdFGTtvZk7yl/BdB1F6O8a6i2Nj6PLTVNukEbF4Tnsx2/aafPt8Xx1DBMfKfMmotEiuBMXbgbTd6oZ9oq7OrnIdfoG/lbxnDAVmj85rj6YHs/TwXvrnLJ+PiEqMUz6BS3NmyakiHtEEZypcrXiPLN9b9zxosUa+/e8awNGYojmZ4NRi1aUgm9LdqjTKrvZgBA9Z5csQp1CteG/MhRXDbJtcUtAfxzIV6o0a+VKCOV+FcGSiKT6b84dkGI1Qg0WG0/bZmpgzQb9fnoP3XGUApG/MGRk6cu+8dVX1sqmgZmpLc0RDleyHS8tSJdebdB5/d469pu9TLt3E5DhIeDRwQT+W8CYXsKe7eqc1yOQr5oHEm6YYcUd4v4dcnmDLZ0txtqj+MjvNr3AARwqmUYt/VFaruQAs2ZvXn10lO0ksrDVeiEfdggoDUapITlXwXjmkb/+FMlCnLIphOAyjfdZEHGL99I3TEZW5iLlEStj5QMkxyL0q4y7ZDS/beEZZnSqfH998reHYYorHXU7EcawWCFyjYB6UgSGgDG6F8UF8N8sWbQPLUYNIaPrTEfLFIQEwtDNiqgiB9J67NRZVxfaGxAFHRl6Mr7hkmBQmWwR8U914CBEs38uIg4wC6sp3WXhox9oR4TqZZ/2KF767ogId5YOPjRi9pKmC2mTHLIbgLJGzVa4SDgVQp+5cb3C3bVZWWbdZM7hoW3etYpbJG6tThzEodUmIShgxBj4L2LaZtioL8y6W8UWXDfXV9jk5+dkKOGxPViykxAvvBrBbE0Ga8LYejQvvNmnPpxwPkwQg+gqRzFFNfsGydiQu036S16llnnGcKKyJ0CP/DlF7tpV7cavtpO5MGH6Tc9WaDmHYR2f3KLCebD9MgRhDn0HApH9jE+bpKlUHpJl62HHcx+2GqbJo+0kWgtdujD2+r/orMnWop6aIPif/9iPqssULjakKZpeHerMlzcNucnJrlq+D09j8jdI6oPGqEva5HSx9CEXI7KiI7PfcjhPvwEWWDaRNTMA/I6isnyz6+SIcx8HMfK4p6vuLqKyevO0iseltxJuhX6A7ylf8P8SfTe55R0e78EvIiorZm7pUlLGC9TYkGTMsmIPK8JqDuoOx/s/aHL6Mv0cJpdBHRxYjUbwGsezNdEaOUGSO3ohtw4dA5VzMT64mCzBSaUZ6VlxdAQRddUzuA2uLS4LA8/ZagKJ4vIZ8XFOKdyphbvw4GVo/BY/NOa2YCkQRtjy4IJdLmPGoI9xkNnuuMWcGxXktkRYvyV68zD6ur/scLUxw2nIOwx/WLjpqUWEunpMbH38QSLJx8mmKqEJF1Ymdf5+l91mFC4Nmzij4HG+nJDjpoSph+E65ZkgZp5CHMTnLunBNDCBmLlfLQyc2no48Lwkv5xeozidT+zl0cP+LjZWXWYnF2J+CzxcyMFOP5oYHIz/aFFNCAOj2U6wZZqCDBkzUwSad3Cck83F83mLuY3bl2FKWpcdWhi0Mn3BpgYsb6mS/leLnCqMi/MNvI1v4xRNQECa0lBSMpztSikVyAGA/LvRcGcqzh2Vaj5uytrIEvIhLDuRyxvdu+K10piEd7z+7bLbb1V11iWXrrjvUZUrjlg88YJlv8tfp0M4hJczq2vm4n5wr2l1RECDNrPoaKrno/Ya0E/E8wTCA83Lbb5qgtLKfzGNgonxY4//Yp14SFIZQZZe8PGwajA0GBzYqIUegHmn1B1E0FJfchTMBE7m+9iVq8JaGwWEyKYbYh2Arph4UYM0wvQGk2iGUnwmkGAD1ZOxcWx0oxFQ/cUbo4tbxP8E23l7bc9JvdhxpxKvl3CeFmttCCqlVtqXhzjscW8fBGD3ORPxSUWPc4b2dIA0eW0DSENm1XKWv93y0wJ5fxQWSHfQR3JGo6anlZzpUGjHhWyzt4U0OO1m9M/bQfBkKpkSPUDlZ2sQjBxnQE3nTHpwOq6JGk2QlbMozszTpFx60SfAVeaRtc1UNtruvu47MaNdxmvymngO0qg9gelpr+GrVttAGchPh8SiRNvYB8T3rPVZFLKNNk/FX0apby4nrAeurpx2bMSI82tPLH4wH7y81wrmx+9NP6fY+Hdxzu7mEGXm27pe6KgQ8RMq5iz7ZvZf9ynhH9Lh+YBm2qg7ceS0sQbTh85num39MXYj+SvLdwvmiFCIRZ0baD8P/iT1fmSeIhudVVMW+MFP+K1rhdk/OH9/FoRIZOCrX5A0Ny1SloY82com9wDT4DEAkBmMWoyxYaG475S8MnJ6WNmdixCEJs2+ETUMy+4ihAOpctQwL3P8TaTb0v+EYUGnGNA/c5bCBABhWBQXwrMK5atetjj3NG5rJYkUzJxq/FURv6qNdfCYWJYVk31jY0j/bM9qaH2Y/5Oy6zhsRf8O6l14TEo7hhFq0US7fRofvTKv71SsxaDnou5PKLQEP58mKrkyIXa3ahTV4cUtUQdLZqscE3XbT7Q2rLXgDEUZsgyNIao3gRVzEMk1SumftGKtHexsxXtERLY+w+3h6MwPMY7uSY/wDUDd4+v6QoUxk9XwPjyML1NnGDi70U8KK+xyG+FXFqdbeBCPWBpU7XrxTxukDbUE5fopCsSlZUjis880BqsUiIAGEoogybM/fNvHn4A0jYzdWrAQQQAHaWvQ8zSzUVTJxVYWViSKdfxWLx2HMpn9+TBLv8E3fTyiRlj8ZdGr4tvhKcykq3KuoOF4Mfxr1WPp8VSL2tBa/9ViwFdXkuG0g411DOBqqmDD8s4eLCS6koSOJ3WI+KqwMSoanAc6x4rXfwwui9rkactQEgJmWqiFjzUwGupeBsV8/hmX3mE/rD2R4KU2BxaS8n1jUrtEY8f8/XdLGj5Fmx6euIqb83ks5LtkkAqUqqsY1ETIBofrid6BHC/OuBJyir0KPnPg6ryRXzyoUzUiWue9vpLbdcuWGVauG5o9+y1ONiBA79pIkyIjHFtmmtE7MgsylmCBzxfWHAnzXE5LBuiPqE6qwoF/lXLOyygADj/uXlSnm197HRV4YTTZrguCBwLzfhgXM0VqeD5XykSuMrQZR4CQGpbkCocyfqxxRyT1SUJ3PzX5A6Qh8TZvJGJlMUkj/j6pjQuMpZuZyozv2z69eGbSFNHD5Btth77RaYOt1cqpdjKcY1CLcetb6PBDdagVikgvMR/58RcEJQLBZAWGeh0vtt1lPz3xXP6hgl+VTvl3+w34Zr0iM8oA01HZOzVGBIKcfIi7HljCCHa9CZ8izub/yVJhr+A3zyuN6R73wI0KJjZQAx09z2CZSrGuFsMDGUB1+YiNGQxMGRJzE34Bksu8rtJzzVFI6EH/5vmlvd0jCbhsHzAXC5k5PVpvYDtKLiBfeaCQql8cSn1vxPh25mYseU897tFiS21B/fMKCIZdXSMEr772QNg7R1VBq70U1tBRAovHlNDw3WbOqvOgO5c/Iy6wqJLtQWwwDt3N1diXTMQrhk4emmspDvJj7DcnJ2TKv0Xqr+JKwYcMMmO/is4I2cmuCBrEkdW6iauSbfLP+vaDd6itMNiZbDnsMNWeOVPLHGas9kx1akAgHAeITuqQaFB/hZIsT+GmMqMZX3j6/jYplILD2q9/gArzka63BHvZ4DDsqK4mXwl6LxFuVy1wh7jV2PReMd1mp6y5Anl5FDLX9hezckdvA7xnY0Yc+/YpmtDnWS3MqTyUusHQ2hakl2noVFEEwgRVxNwVfLT5fg6uJmylkd/V1GQgEq9Lp8hZViMoE28bi/ZimrteVAZS/Hbrh0OP0jOVCPcKyYYAWIsDQfi8oHxdvPM6Yze6yMUABXFQlSkFy+B7iid9Cl0BGoWA8dhezEfkDHjgBYclaT7nNW7AetAdSNwFiU3v2+MQOMZIoJ3XkkgEMl1uL7g0V/N8g456iztxl94KTqWJUkmZh1EzF52mmZ10VTNEFpm2T/pl3Q/t7yPnuQZU0tkOkPGXpIyiPHNWLZvkaH5ZbaaYWj7lecIBLwCzkoQX9FsrLsIiJvr4aYUd06WUq1nLmEqe1apSvCZKKu/F1VZVrSFmXd5b/1Du8YGECjrjjBTQlwTV48EKeSaUG13R0BYW+SL6PloXhcqKR6ApuLaWYXvtx2r72kzp0ZC2kYxO4+HmAhONkoqQr3ApijNQWmxtuKg6VD1ljoHH7vU4W9TNCadyoJdtbL1ROkD5yumUgFxHh3JaeZKZspU+61UkLQTkysM03kH645FZo77dSujQYr5UZAKAyJLxdMvJpE1q3To5q61Vu48ubyVVKgtwR3Zp0bqqUD57cVAhMLgNplgSZxh6Xuw4YnFwhFhxXJtsgs7sePTCnMY5FUs85UPPA/uvWtYV94+K2WvTtuTcgPuWSm0e3S3F9NRn0BJVNTZNhnsVSbgpfIaVd3QKumU5I6rSqLYeVoXHskn7h6PlXBkBMj6h9zMx5xAfVjQYPeBQTT4NS40yi924zIKUXVS+zYzpN+rg3KzoXLgKAVir/zFXkkuQ2B5GkscC0ATeq4whu+D0jD0LTkWZPSZImX7EYpJ9KCLJW7Iqb3h5lbOuq+sRY11gVJfU0DNnsDZxIHieU8BbPs2YlGZnlh9h6kLzSoz9spXQXU/eqvBSb9p8l8a6v2YQwIR40D8hqFqwap3BNCTrItMtbbenuItxpq7EwWr+ZTWsFcLRIW4EPL88dWj/1GurMASxc9IzVfXTSTGzjiPk0ske5Ho0x5+Q5vsxK8YzaBYLYsNWMffcVtgcon274aA0aTGQxooLNLIFUWOqSeFdksU214NwFk2Wt6DLBL77tEoPCtcTknjcvsdcJJB87SBydiwZqseJY0wCrdTnEdW6uZ4qe5g826yFG14npFjsdaTWj7bZlkZhP4+8fVZS/wLZUMdB7FhmSwRe4J1NhplZ+dYeeDmxBywMafwwSBzXBCSlAlVLdNCDWshPCf2pvc0S0TPPh1bB78Ip1w6b3vkxYjHIW90OWop4iUP4oyf/Nfs/XxH7gKtOOyGIyej35OTsEs9XCq4D0RO9/xbe6DFCd5I5Q6IhsywIpGrf84t3hI0jc7xhfqkCOSxuwu7CJwzEptuNnTe7bwaoZduTHV5xYb01wCPZYAe1ZGSErkRaSokz/NdSFazKlgnDPAuh4+2bGMiv7O9RzitJxOFwMWOLKyF3aVHdteqmzCXukwUKcnvaY7TgP2X2hiuZD+WrF04O/8WWbD3M0LUbLeLML7slwnJ+k1RTi3/uT7VfCsNWJ7RFhcfQK1sLngpN95lu9sGEo3+ZyazkogYJoFp4DiHowqQgZ5lJEG1APDR5GbdIFsmI93AQDSR1L5wneBISiznid5ksUhxBa3IdQjYPiA+EQjJklFs9Qd8jr6rEYDEJX9h+guPI+BLDa0ovxpCvb1uKKD1AEbpBT/OZp9gYFSSJvk+1JWNN2PWGmEQMv3jqMWtJrBvO1gd+V7mjfMWs0//qoed3jAiwp/rryZvBqUMLgJGiumMHGPWSj6DAX9jC+jufWGOL/qICej5WU9mV+jFTkT8cF0kQzjNRoaVZ2US22T/vSye7HpPkfOjJNtV/TvTXUonkVr2wA5mAHTyoMYZMLK883GU2YMRDY7Jv1/Ol8MNVqAAifsQXGIhdK4pAK8q1+Icd7r6cmeQfDfVWfP+Zr9Grt5rK0jYQ/r7biYT5STWD9MTetJ5XSQMzuQ6T0/YqovAvA1IKIq8GvkzZQxuWqN5ifTVV6sDBUbsznX4JIaXwvIc1caVCmo495WIqzZ5zmUJTTaHzUDup6AehdGyvnZrcUZvH/H+eOGYCHbqMXBGNTY2AWOULCVT/LBIsnngjWq8sLEn1+u0F6zgAEYVh2qkrc+so2qkJyQE7eZxBjRwi+yJ4hyDKnYQCteCKJ0i2UBNiF/WavTYiTdKi0Jr3SQ9D2xPga9SQPSaho2EwguLfPNp+GeIdJz0YevyjVLIa3EetlH51Hg0z5D3meFs9E8SW1NQ5m2fTZJaRWbpLrkcr6J1Ar2MFmZ5o5l1iZLeObJik34iPBlXpf4wGhzKtVMxllhAvYXtNokPiVIwghYcW6T9wfNf0iTl/jhhk0ESuLW/ollPG8O+JibpJcOA3orUnC0BdpkQNOoTffOclj41F4oart33OxMhFsNA3ul3nGOSdiCftxn7OWLtceEQYQxM9KAKKKvmKoIZ68933cvt/JPqGoolnM5SxOEdZ1QaoYkItRVRj3mRhsyZd+sqpw7KRH0yMY0QwRAUKTrROghjUu8lPrrqhOoRYOn7tAMHE8QY46rfoTpXpHoJY3++RDvgsQ15DXVmXgJHRzHJFueG04oKE73+nrMs8DQUo/Bsoqel8VZyptlt8MPCv2mR5D4jRMKmZlCEAG0ImI04UkO+fN//Z3jP0R+p6OeGc8oPRtXAdstHg548Xb2WXnLYRdRMhNt3GdCYzzz7o4XNCJk/ECj6WpeUBzY3S/gKb66ISwjBAIhfhg2vhC11COsMMPtPNmYF84yMjQVfowlj1GqIaaEtcYFvlsJ2DvDcCDKmQzumCABb/KnVkzLiNY6yqXOiKLhT3xv5+FwYr38AjWEfBSBIlw3Ihdtj2gWhywrlOo7x+cNH89NHeMjdO9Q8OmrmDIDeChGVEaijE3Ksc8UohP+SJRQRaF2QddGawxAm/vaL8R1RwbVClDG9HvFCV5CZkmXqLI5EA44nKtHflHVMcaNvkHvk43JsBnsyd4A1DwgsfeQ53q/N908mQvvnE3bS/o3YUARICHIzQj9jry1xIbrpPH5BWuE8swZZoNt1khdaSjoRYdcEzsrWuKDWPmQlt72GfHV6nbQXsLVt7fwX1yvdxKRMKfNTjNEfu/UXu5a8oqfmhQdBk7Kutv+PP0qQeV/wI1B0DvH+CBJY4feXImMCR9GPFeRu1wwDMqX1xAKRAgNHSIXQU02+vY5CcZCC9mtBK/eRrSWM9OXJLtc6Wqb8e/aITm/m1TZ+rrzoz1LPbyyuxwTiGLhYwoQBuIrQX6pS+GcMrmHmtYp9qvsBQ8ojAD8eWrIsNJV24/M/wRL3nRMGfEttae+AGaLD7VkEH+vIDSrDeNmTLh14y6GeaSUh79wZIIlYB+Hlu7NF2peNCGDlpYs0q3/B7qpanYQOM+CTF9m0ha43H56c3z4dOqMeJvzW8qHp1wPt5q1Ie6MtKYzlnbUiVzTSPDMeHoV8NjxvleM6US3qSRsA84mNpdf56g6xsW2GA4DhTGUaSHcjvnw5ivVm1BhTIYSSrIs9X1QCbh8JEC00XJOqk2HTYG6NF7EJ58BwfSG0UCTz2CR6ZaSXDV6DCj2rk5gjWIhZAZwh0OxkOfr3gMj0fT3TcB2dxKm9GkacF86gDCU47EBi/PdQoThcHC7m1mTmWYQNw5OZQUVLHweFWWgeT3S7vDQt9cI7MAXQHedk79dWksIufZzAzNkI2v6+2wkdlKKfSu9cS5tfe/EgLsY7vC07KKSaB1rIfYlJrZNin0vIcu/ZyMYBHfBvYyyNaSyvOE5QDxFA2+SlkQ2qQOIi90f4Uhgi3CMbqPD10iWeA7iI6lIDKsgwvi5ltVed/HeQT9kMQR90zb7E9C54HoyLvHGS2WyeP8xjIBpPW9KWQb5A8mKU6fammbiklqhqo3CjWPeECe3gCaLDXfRWreJxxGZn/FNRKpDC1XcGoPQRB6F9I+9BcqVsFJw/GwGO/P4YNH650gH2hK6lAe8K0veUFMd18Vx/shyCRJd1/KuCU4xAVVpkocbxFEqUxfGFI0BsT+DSkDaL/p5iuqrfCAP7bn+xDt6MXhNT3tCsxSSq7C/qA0/I2387Ka13NYNNXKInZeYYaKAssOHXA4rtWvpc10q9fJ7E3Xxb0+VnmzA0NMl878EwUSqQmM+7/V7K4vYD0t1OC+Hzedh0RIG0TVsEVO+qrFf6pK/txk4WO5UO/5+SGBoMm47frJmqLzkTjXDPKH2udDPNbf7zvtR77Dr6YADDu8iPANhp5d1tm5OKzW3fHvJ7pLabWgGxT58i1P6H+U+2D71lv3n9Xl94uRGH6/RYnT4xY/WQHxW8+BUP81FdRizoNugyp7gUTyIgUiyuVEbYD2K/tNoBamCGNnQrstycH31FSX/az0idYmjcCtp2QLEwNkdFg/cZzJda+HLvh8EEDU8+nzbqbV25nTvqjG5Q5CMkRyeubdPBem53tbF4wmzbEmgyOZfDdlnlnpoK4R64yTJHVOjOEd/EeP4sMNom74oD0nRqRBWP8bfkzL2Kx+/L68/qvrHZUvfuFwx/88KwbOkFgNwlbmAYzicLaflNHNAAYpYFPvxEUOm4a0cEI7xf2oc196ggwZizlkngJ+WFLNLKtYirelwK6tWUhAb9JTJu7MrQo+JFJcJMUuSgJisvxma4N5QtbB08oNUnaxvP01UI8p/N/m31NHIQNjlyAHk1GyaLTt7flPZRHRE01Bz9JyX78Iuq2a2PHo6tY+TpXFy45OXv9ck73CSjg9SS/LY1xMVyd6Shw/wjwNKmvf/r/BJNt5TnBPK+mxVxNZzABaZSikJw0L6ubldb8ZG21DK4gOBlf0OhuiLjlUKXZdAbbucXA+pBqFf1q7oRzbxol65SsRdzhFGryMMCohg/LUsLRnfqBjCK7ZH2nallDnt2eFTa33WRevuqGm5P2m3QWhVcayvZhctBZ3+exhJERe6VJloQD0dnHv/hh8lnOXp3J9769EHydSwGphvK5f4kijEDQmIhSEJHyR63RV6WW343sMFM7rqenCP2G5dPbNiiqQ08BZSRPqNif0KTQOgxO/Ehg6ZrEGNuBAYZ9L2XSP1bnUIFAbLthvThgDhnx0A3l4zKEFY4Xbx0zE3dJvlpedhIGcK8zKZyZMHo9AmaG4TZXF8/xcs1TrWOvZPL0/OrNOnAMFBu6fyuXzFtocN8tavyK236PgepX/zl3id+eNMuGsp9vHDOgOM1K33qPsuSbuZ45asxRmrhD9PrIXfJq3be8PITSXwSpE7QlZQEkUCzIQYQm+t+wYaNh6hgJX4fiAYfgRmFh+gDigxp3gCe3JUdiW+et2FzlsePnKhJWLfPNTQhd6BAmZXEu1CQxgVkpZsYGgakJiSVMYOJPSoQ2KjW3rhhqfXfVTa+1vxZ/LZzaPoeOwEZ9gXX4/oahnuUgSHwjW1EhEKSGVuFRS9koXYsEQ4RvFm5tyoHwTnB8KBbkIB4yOGAf3od9t81pp+t8e6s9dRB/xWDUZt2VjJEMb6xzqJie+iEvQ3zsnSCJ1FQl9xLuSYUbarLpY8kL0suOA46XPCOIRntkxQQXVw5ZC6yH/jV6YoB61yDWjUlb3K/iZysSXHeQn3Qm6btgxbSbW+4BMsXC5c8kq5DwFi2jp9EFKyhhL0BO8lUv4Bdo5h8nVFbXdVplooC3zrKq0ObvVocgZ4s4S1DrSADupGc435VyCGpy+AL9qleBbZ/rp+F+TT4GhIKTKnPk65H9fdrmtcWYQ0IFJ9R557DN3y/95KvBEDR4584NBvJGmstvVTIFZJq6BKT4LabbfjKHVRX7FKRPOpHI5JVX42ZZpvmar90qYpvhJ/8lwVWVQwlUj34BWHywprSNdCqrNkSJHs7MoGSsVNbL/vnuOpJwbgsr6V3pd62dhbcFajRgfjGF0hpdBMdnm85AI39GffyAnwGZnYRU1IcIK/OxhfOKrzj+R6T0GubbFdO7oc8vJ7c08jIhdBkl6vJ5+8vLMtRebnijQ6sC2w0MTyVolGSdt7E6CpqRKtrA52fCunO3bq+ZLe5su4E2ydOZDm6rmbh4o9QoMDqt1p3FE6X9zEWSOZZuZTZ2CJGIiY+oTzp7yKff7KEbbk2tn0dG3LL/sIrKSt4H5Sxp1rPkzDCQDFEE0lguZ6rwSpUvvBPr36LYkeldHdSpT6sq7UoJaMlVWKJXwsvzr3lquTtcsZ3QH7JC0CKX3Ftozhs+f+sM4UV1UDkkA0WRNJ6WPJdHigySYeE6je5da3M2guNIGdBoyKA8kGMiW1hWwXWeUg+vKGF955/1Jk5wjkg5JJTTlRPilaC75wrGXMZswIW5OLVzKhDPa7djJzVTyhhbk4me4jdJaBLkLAfLXWa7gf1xMUkLozAEYrkrLeR7kmRkJbGq0GS04UFTYwrWMotTuu5Y8sa1HsSZ3Y6ry5/R3QXnzK22SQTNBFHJ43IRF8CZ3eEFRkTJkq2LVxlyS4qXtM2aBEk4Kozqg/RfV92n/fltJvgLR8f/jBKXNyRQPyH5mrL3dhRKWuvLoFQNR0Mudocu5zhLABHudn0UUagnr1l1lzhY0prZnBadKfLBEBmftAZaJzcJAgOu2wLJdhyOZqvxDDWMp5H5ga2DXfwsyz8BgURAzqGhopHEoTAjTD5OZvhEDz+KV7feVfn1I+gHeF4C8K+KubGiX700ER7mp41pTLjY6JJlU9gTKcfOEiAAekjXXGKE5mLoK8qgqUp4v8gEHD43HyB3IHTzg9kEb/5SCFYTWSV68XT/c5qhYOOBz9hrTejswUTI9C7rVCrSrzYaNvgwO0WBn805zEt/Ft+1qwxDeiSn6qAAaM4obgOfrDT1MwDXsz0ug3ubMv3awk8wRy8Bb+xc5sbzyYx0Z9CJ1isKYFtwt91yYoXM9Y9U1ZMduLoMN8rXtfD7ehRro1eaewJmFLz4cRtix9oIaU4MiPdKyF3qprr0MhgMMABs9yC2oOPkcoxGloy/ooR5yFmlut3F7ilC4g0amlEngdh/F0W5pVIr6D+0tnJuDx4KtkwtZ8QUFiWW1KCLu/JpZBsyuv5J2ShE5m981CHm5kZ/z1gQ1f7c4QBYsAGuqcHGbZ0cslpoRA2yxuRNRAq1L10qQxUwuihfrX+qxff/aCxO/BJJElMcORvaHzKDK/+36II+ztHFHvYcDDL2hQDs9naAK6yirweiWIxZB05mcEvhKGFi0zEtqXbzGHRjgQ01mX6eHR382swnLyurLI5c5fQvE7piIk/WT3PJJQt5UO9lEndOuq785mgOtBTXNgWwIhuwkA3zlLUR1qHu95bDyM6mhphyJTYr6eLAkA5OVjDtUpwBFSQ0R4VEa4qEeXt4U1Gd8cpG+hKu2mToaLsFXbGXYCy1qKF2h0uPS/eo9NuX9pWM+s+Ig4zXS2CgFJT05ELC3palhDqH/Zj3FHhRkVlviOzkhhH+9MbTFKl+7Ahm+wD68i7dCsVmoC+fEccS47WEAv/CCnuA/acN+AK94P8gJFfuQRZMhrTxaLZT78+QPM39OXeXlP9XHWVSCpxUD2NiJt8jlx5ww4g9Hsc5nw1VWFDeil6Wp+ItO40Sl590qnO2Ne1yr9RvwvcIiPy93ySOpgfva75InRuj73rWyu3ym+XkwabMamo8DfrVmLrrucb5pFUOhseBd8X750VVBZpeCZVcfJ0uqSDbCzMHNVHDoT6aDQB8upayhzl4bdGoG8vESSXB7KlgCNZVAYiQoNT6gcZbnOA1uf8cAaguIiQu0FnvAlutWEwY4hL9m8UsvOqQPHUUSDLmx9bZL4YdWeJ6KsJbo1A2UOJBSWvAqoRXTaJA7lLLX2kGcW0CbthLP4RUU9nuqHUGRtLnLU2d6l9lcVSmwcMVgxhD6VYqI1qMOxAH9dl8NnjMUaK6dItQB8qIFHJIKXHSajNlZn6ZW7TGDQ7gc5XUBxmWAKKdkOkJlfN60/sG796lJ9VEEBIDEGR/aRcqOMt8icSI413ngov7Nmr+dy8oJ2tNYF8HpsBywDBBJeYqwHqFIj3zREpccuAJqCHasFHdtbcB3pW9oCjzBVrUAujEkWDjyVln5wFikoVf0O1gL3PIc6uOUcPYn7rLBpbOTN5zQ/5ItdcUuWOyJAQOla1lrpALz080NlwXlvrTTRLIj+WVN75gZnNEPFg5e5oA627IA1bDArJFsFR5I4s5dbdCviTmtflZZloajJ6EAyTGIBJcPgan7VwHRnhbmp2vuFCjnokKvT4yF5of/HX2Z+T6wPtz1KS29osp/nQfR4IFjTV7uqbExnvuFeOfj1C1/pbZbpKC6RV/Zg8AkcJ3gc3Gn/01QMpqGrACPTOjmRFy4jGum982U5Hbw5UsBQWeBa7mt0Pk1vTRx72Lesv0hTrjSXGa799z7nln+dvK1hiRtF/ABIpA0edYlivVKqPi6kXDqcntYGarbTJ+eVprpQ8qw8EqiOmiVf5RwUy9NLxlwwYgzMfCnaSCC3pi/sOrvXZZ+pdZ6GRyi13LeLxgt58bGLNCQxBXsZO/hChw/iClyhJh8bUKZYyNOWGmNkJsi/RaACnher9vvaq0aLGjIuTw5WicDMEyb0BjCNtw6gUobOKF9Gwr+JBZDJAQbQNFiixG7yAxfWcy14Gf1kNulj7I4WLg/284bsi+JPbvUa78p/JmV5+PWyHwGpvUdsqYEF38OCuy4QnC/7R8ITUK5waVWXgWmCNMcKNShh/8iAG+dQQx8Ae++Q0H+RNlAeDYf5b6819GmfZ28J/AXlq1c4mD3nxzZwYU1qLEF7aYzi1IAZ1fhaaTe1I9DTnY4xVe0vPODveh0TCawYRPjaw8Cgt4a5VAdomo5nAQhJXVwokhgt74t0JIg25kmY/v7m/LLwrtdIiqCWpYA7kKYjdJfa1xtQDokHShPBq2X5CNe3hp+vJwUJorgGy1xUD9JfZAXXrvgJ2tPTDXs+QVVqIB0y1s5UsBf0KBG2UgscPb45b2/vjt2ZlK8BbVhdxgw0PsbyWJ0bIbtVF559Fl+ZdPn8CxbDvGtSZkruhn1WIZ9PGkvGKuBvT/tNqM4nsFTeSD28A9xhmPu4f9LKxYEUnYOGyCij7AnR6OpiJmWTWLBhN6ANkvB53qzajXaPekIQKVerxkM9yw8397I5zVYtKwuY4lvs4BWrDT+wAEmryz8tZB+s/+U0v3DmSX3Rkr9iBsY8xKEkB4rt+cTFCCgfG2edQ0YWuPYaBD65eVn7LvojySkvTnvL4EeXG5PctJDlCTAxjCmbqnRmamp485uuCmin6N8jsh5wWQe+76OBkraDjNXFr3MssbQXwypsjQwDb+8lNQJqniloOIrgISY/QMGUQpiA7IkfNvEqtYxBjYJ+wzAKVXNRN+ZFy1lYWG7Z/FBiYuSes56dvxDHfZJgW10RrkTZU+DEf9L9bI9U063B/xwIakQLtLu8cWZ3Uyh986zoM0uawzZG0ai+cNcHqTzmMRHmzHuRe9y4wO8S3jFSr8UZlxLyTxtJ2eCxiXZkX/UVWObSq1MLZLHQGx7oeUQHQbbqiX3A/jGsAaaiWCrIgG/CtN3mLUpZ2A8zORkl458+QorqcftUMOQ65bUTTDebTGVyElfmH5O0lWcOAZ7vC5i3bdcmF7W+EibSGSdEkwvLi0iYhmgP3ojsRb6hsyhZjIWKkHBxC8s5rXJnAw1HvRTocBaHXPRUU6Cbm5XS0B78BRepYyDJIT+G+825qIojK3PLHW5jZQRtyGVdAWQ/W769iwW8umHtfqDAc2binL0p/H+Ca/HWqgGkTuh6t63SDcy2zzdZovpI878KGJRIi/ZlYXSYlExIq/c56U1snZSuELeBg3lNZY5nkUwz4g20w6hMPChXztbBaJDvoIMEraJECNHhS9gADqWhKYVMeayouSnaPJcjEstKEYvDkGP+/W20AtGZNf1pCjx7K9831V7DWhy7NdFlwBAhmNYiiluuamtVzA19IVhAVMVDNDn58X0xONQYCHb2jiCAZV8gyj+85hUWKLlIjrGFy+KiGcsm/rHp5H/HFina0cQnvYJgrhqwGbAw1nmnWP8orhj0VVe6Ng/AJl8NX3T2izpWA+PyX7sDUHL+RRj9r9QCOaMCdeaJ57AN/Nmxth+s+n7bSaZtufkXRZT1D9KqkWZB81abPfjla3hG1+1ogbKINx+jy+OYRRS+kvijhw1jFQvVbKwKoKdWx84SM5VakS2A87jt3OYdqT3satl+6uJ3eoYxEcm+5l1NH73KY9UlrMHxmxBNjkQmhz4DhUrXCS4yXYLwU6mpgMGrt88jR/23VhzY4JB8vehO1EXFMhw9maXcD2Ks783GSyZvgnuzoMSWhVvuo4bIrCJVpEj8/olKCTbmoWsDY2iiwAYO0P8NM5zYJ4voP9myb4lBucUgzBpSGHt/d8FRkZriVN3HI3+g+4uXNdSJAGcch2RmhrKQgmofum1AUwsu39PSABww0FIKFGtdqqC8/WeCSKOfV2lIo37tIhEFLOYiDGx2d4cS9Jm/R2g/92wiERY7GBQKqQUOKEbwBm8N5X0fVHSuUVDj4OE/LY9rlEjbheDk7zmmnxPeHVMaDef2xqrxWkQ1c27si7auu5guYnfqBygyi2uciRfGRVVjNvuWraJlI++UbC2NA1b/6rnCKEiCeKnoGrFFumhfMForM2EQHRRI78L+MxXF/j5C1IYqNwQah6ROLUXHJ9Ic4HQsrk2XdRpDrOR7QfXMO2EQ+yLT8093ryCX35LtoNiu6vvm/ToVgSJ5q6WCNLBI9tRvbHKa8/ejScvFqCXdXoxjzlaIOy53I7raJp7vo+61ZYwWZ37KpyV8SyahlcFOalT+TK06bBj677RUvDCxEmjXreIjipxADxgOPbuKfHu42xqHuyrD/qLeZNhayZMiEmABYzhHsIO8jkYfGa9iryga3ECJoBYsKtsdAVF0R+YuZKoERGu7ghrGIVseOnSYorAERTvsMfuUMiVEbTD97RXhSZ1tNQAZYxrJsbseyiAD81g+kX1B1DpeLQyTXcI2rosOo8AshiKAl/Ou+AuwU94v3zyw4KTJe0PtTkUOs+hgxmeaivlOlHOuqcrNyOUKU+1doUMAOdGtWUGLXTLkkQZMQQCR2XhjaxfZ1uBteNG6XPp7t2rS8K5S6hzetGsqYGt/5niJBDcbQUsEXrGYlowNhcn6ToZ4TuYU+7Xl+vO4H8xVjbzP2hZshBaXf4Qze/ywwtO5M1+Do79R29y8u11TmgjbYhHTBKMCs451Fts61gLHizQcnbxh+FvNDRo1IbsJtarl9P9HuNQRzvxKkpWXUd9CINARQIQh3TmzBSFhxiTm+qy3RKbb5F82tooEmpLr659vuNdFoo6WegNmMqzYyMZfx2foOoGGTEbFW8bhh5AGqYu0SnNdNE2XxAqNhvQEc2BDlZ2iiXNUMFFXVdfiU0USTg2TkCQXImbcME2K9uqQBIEkbLc+T3hwW6cu6UBbRy4HCAxhUIe0fQYJZMJW1z6B767Cr6iTzpKoAG57zkplf54ELbJU0E/pR+7su7kvULEh49teMdrFgQLyBRBPjjRUkM/6I/b6XzKy5tu5ov+5U0jhZ06DNTHa/b0RaAWxnIoppFw7YxDqZwpceH3x20CXHrlVZjJ2WUbD2kzyiThCmGBTb9G9Xof1QV44h6YNfc8Z7LBUy9iQQWIB5ot7HIFRmM6jJKIdnSrdQC8OSCu5x6tTppAcIGB/lrjXS7ilXB8GRy/DoU8CqfNoGbNLEtQ4uxi3lbTRLt1XgWDv0iRU/5yDl9wHw2Mp13pqTz0yXyPwoaJid5HECB5FaLcaIUQaOBChdRYeZYKoO9M7U5s2aWiwVRSm+9SurpIloathx2s9ygo26DIAxD1ll/jkILLkk5C7y8qCj+CS/o+8nyfDkSrfuWd15pMF0z0x6y9RogOy21wbe86RGIhusXkRxVqijSokgQV59J1PV6ElpjLnmLkesaWpyyuh8R0Ghl/Qu3qfCRsx/WOjDqfTHZyW3kssq/TPVDe2zzT+8TLZV2eqSH4rtCOqQw/+zicprtefKWJklKGyZAOP45kG6vBm0IbdZO04dyBL92uk9XLASOQlcI/eH17ni9iFAIKetTcd7o2We4TKYsQDMlk/V+6ZQmMYT/P6itqLUu1qJxMS0WyQ42oScHo3pSzbPvOs3CZnX5d8TU2DzZhJHbPYYMARxLAMly9vYDZWoPCp6GsfDeLWa54EAozpKukfrNa2Hy2CrbbT0kWQhjEuzr6HDhoH2Z4+ImR5iOHuF1odmlNBetUol/5PNwkRKC6C1iszJqpAU8E3+Tr2a5Sdq6kReGbl+5pZlcr2JNP48/lKCDGsZ28YSGhe4G6tsFO2+vVTpDoFwYTGtLUIDC+i9CAfcP+jgLFVCXp8G7r19CuDBu3if6xoQwYFukwwP9iRqbEeHklsD2pcJ9IzyXzSu1TFDmCArCuTz0X8zzPd4UnQecgR5dJcgoeb928OAYE2sJVIRRS+ZlelibDOwzCzbRAruvmGPIcrcj2jMUHJjxNY4nM9gDhAkCmeZTkXlOUlzgGLmAWz9mhbVg0RBQiBFix+feVx9AWiuvFuMjob9CNCuWRh5wWesDgIgUOywcDqJvZSx+BBj07mQoGWY3lk0milgGPwl6P+VcZEayMIquG3nsZAz1Py2YSV8MtOO6cpxXMiJNn6CKAMzzqHnemsqewdhfU785iK2T6r0TkLCy01kU2it1Ks01FxNR6dhPCHroH88GyEK4w450niMLKVARFVpWFQEdiK6NYs64F9SX3pInnj+BRKth0jnA8uvaEz1lZJ9xzjFqGGQv+1ZF/HU09Ni+ufIyqkj5bJXTNrSSH4j2FPbg4VN1u0AXEQv9fI3qjGLWJzWTZLIW9nDSh8g9L14rDQtl9RC2XLY9OHgd/9NXe097m+FLuh+VBYc2K5sdBlLVQ8HrPOznlz2VYyqG5kY4/JChLNgsE99XQfNgVxpgTu6FPK26eq1zWqSP/RtWF8SkeKyEOKoohISDmzVHIytX70wC88ZuPg1S2qXL69e1pYUDV+HRJnJ45AsIyvZb+Rfko4wn9X9Q2yd8knrSjPGtLPJr35B0HGadcKjThXBUJg1wLZimZ/WCqJq46YfwjiROfLuKF6QbR4WIgTdPUWdGkW+YmRhffDsq+v4AFLR0PAq7mdyXXOd3VmMNkaa4/WDN9rk33ytLLZMwLxXFZbXwj7pd05xAjgWc1HJbhN5ecTJ+YwR9uHrKvyLmHp2quOKeTL6oNaMW8sGttFHOoqiPCS0fn9aHMK388kn9wGnpv8rUuPH9LvHf/Yh/SrhstZDWDSfM9495k2q96bo9M2nxxazfi7xHIgOtEDitY/ZKxkTRRDPAVtc0SEFPRdwKTBoJCIuanO0RRJrNGa2ieDOGUDYRpXQ5rEbIt6XdBUYkWp8kB7jtOr81NJWlSzb0x+ftF2MilYZIlnJC2MRZnXbWVXLVuJ5JAqu4EV2YERBpweJr4SsnXf9M5jsT4vXngSqCWPKbBw79p2s2903cpv6hmwwRkwu4beYtZHiuHjnf0oRbZ35TrF7miihcXY/i2w8g6gkyy8ujVCCbKqxA1C3IYeehow1lNto/g5v7/vW8uKwawuLXGJnzcO84Jys6XanqF3uA6kmxgo6dcg5nrltvUCPXzu4FuAZeFzA9tRwQ1IlYsgWT3dfXCsald3DrYJBRxOTWZE1wDt95LHcr9cqU9msSn6rDP3TCOa02ZLSJ5DgmZu2JV1vh2A5eBtoWeKYg5RqTTId1RbKhPyGk9x7c8aEJQO8gbPhYQdjAFBHMocmeUWXPKsqRQ1dPDtbKwfuPI1eUGhzmez1Cqnf9/wEP4mpmXsFMPybi48SmE9k8V/xNYdkgi+my3+B218sSTabUXn7p1+vxRBWlylaa99LSobQu0bsKvtbcfwf4xTzNvFUzJPkv1qqvHI5YFsB97FdvCHbZ0tOHAcCpr1+ydvUpxXVHJ4N8L+BsAN4XKCh16o1BttsaKwTgS+wNoNKtQqsqc7/cNiLcHqZl5JBkeEJFH2Jy2kGIYYxaEmPBz3WMC7dOwE5dAzIH4XCDJ94rDATT9g5fYYJlWspbwLdWErI4gjnLhvmDdKdd5yFtC1rXcftdMNEssqNeYKJthszDMSSZbB2z1tV7/niJ9kx73lpDkMtwGHQcGa8rCqIDCrX02doEi/txxvq6uIdPVW2dfjEihPGUKqArgRoimGaA8PLAUbyl6jpRZrv5qXjjN2glsaHXG3y18mhCzPt24w61p8rtMVx9T2j/CS8OFmTyfgC3ugXntbbByLqKdqr17nTUtQfpS81Ia3mdwT/XPUWZAZF5MiEYF/nW5lzUzaB6x1l3Mt0GAP62lXSI5M7jvRura0PVx8m4aj25aKQl7JebBzhjNDJLG92m71gRIlsDMIqaSKHDQtYW9qaZR47IqJN64snrOO1DiIv9ap+LLqm8Ho/qvt3sZxD9wVEIqVdz0PQLyOVa43cKK+ZTWtjm/BzCY85YK31qB/DQ2DBbmpnQzFQKfoeLOBaQu59E/amT1K9LRLP93aLeCyXIRsB02myceXIzd3h3WVBxWtUCpU1T1XS2XlsAgOx0pBcrgG1rohpOcNXJGdOVYhDY8KtrN/RFb8itdw0PZoL1liBbMyXmOJTXl5ABhhPqAvBpy166aby7R6nacqecXaV8edbQuTsKYUBM4dFUFUGz4de+9WbCOqbhYCPd2cdUEvvUFdZ36OJG767iOd4rExij1Y2DrDnYjUl2RLFwsWdIage9MJWlj4J0mC+qGjQAQb//nGWW9dH23+JvD2YZWae4YyBrhO+czzqwfesLFwFX27b0yidZkFkEhWSrzNIMKtM+KoXX+qulidM0Z4Y5XeWx3ZKrfgz6Mrtu4VZSRXEFGs+r/czfRq/NpjxiybNzgRQeIvdAAr0eTf2x/gAn1HPfIOVsZByWDchBRtrm0dm6S7DlSFpgDyIulNahCdLjJxuTSH/lgIM6eS22iKjHfH82zQ2iSuzTc1Eb1ODfX+YAKIAgiAbMDETzGixVu4/3cs2j9SK+QTyiZga7OXrFQJ9W7kPebW4y0KWBH2ipaTy/4ldy4AAaDBn8/T6aJevrDGSU/ezlr8faoRvyxS7aerFj0Qhg0Sb/23Q1BdZfjfAL+DEbP6Zi4lqkgtl07fUryGFirz8zia8u3PN1LUbxIBG71ZiKQMpeo2v9uEkQyrYSY8mDyRrITRql0VSxuxEutT9egyukW4DVBYb+pay0d6FVzgoY11/ZjOXqaLm0hupD6frLhzKnNm+9F4TeRTobaU65OqU7LIPyuO00L7t/4nO+jNkbPoMpxn/fWV2wdWOBwhKruzzAIp/qfAy7IeYeWWpd0ALVIgzeQJByAtPyE0DdIYKevjsJdxlz1aFX6GOdNUZRRHBBSsVn4Ne3rJK9UlxArq3JSjaceaZvbAcJsjPc9ApbMPx2AcWQyQSXijxdURJy3opTTq87huz/uZ+RIsDl2j6ou/xbJLzICKGWKENbv8lxMsaabMXi8g69Mz5Gnh3SzbQ3Ar8XxJ4YHFPXFWY45M+fHDuucVdfoqy9LoIAsNYJGQsKJMzAdYF1ZhPtngkjh+iNYnC8HdCtOm3v0WGIESc+d0pUEO0O7flrN82YFGwRhUW4fKHMan1N+QV+c4oAk6Uy95ztcJNUhe1oqcL7/oalf8JEcDTJ+wsgpYp63m+pZmoEWruH79aGHPI8Rp9bw5n/CW0GZ3NWVb6Cd+qWF8sccoBYdiIAUMehKIEB0wa8aObRMDVz5O7g0t1KPUJ0s5jMc3O1ynq8kSsBBGWje6kpHiUm3iCDvAZhvzU+pLUgm42+WCpcU1pZ6qFLWi15ckNUZ9Ofgxq33WxXLu4d6vz+jMZvXeV0u+UAFKx43QyKPDjivSFRlvRbEp0CERWFU0QOQ4DLQmGSAI2Uu4QNMDN0fn//mSzQWpXTtu55u7GTP1MOChjewRv8A27FRW0fREmV+C2OeWnFPV6vGf3bPs0OeL515rIUZcFGxAHrkuqVFZsuHIzNVZtWjIzC3JhJYvAZeUw73NOehlqSKC7L9CXeA73ZxuBfrywRxMypDnM0j1zgiJDiEvkomJ7fCdXnHv54azw8BaUKO5CuK3S8SXzEG6DBpL1a6YN/5kDsQa1REBNf61J09CYLf8njHh0ivNPoZM4Zrdwue3DFxobTMGOYI5bDSkFbO6ZEFIyg6ukO663RGzlhPTFaLUXC3TTfPEoIiivw5W4itr8h8xttp/cjM6iFMBIVk/YPT2hf7laHvWyQQGQ+6gsQaDyLupSZn6Lw9P5XAWyVEn+Do9zqPANKvbVWMxxO6tdzmFuGoICREa4uksqDBGjDYJgwBg8gMA0Yi0o/lspbfXH7egdtM+ya+qFsOgk92I2gI4LXGivkp+vpxmN/p0RAAiu5kkh4IbKx36lnC228nbvzdYndIAQCr8ThSdm+oNz/Dy2EaSvk8/Zlw7E6PAL1+698EqkOzGzom6zy2vgz+aUGrwBPPSJ8q88UvupEJLiTsbEmBs0SE6JWnJ+OBN0ZsuxnuOgPAEFFc3J6pexxZCISHptgr8HFLcIhk8vua3Y4hRmLpMAfx6C4UHUvTbgKPGjJgq05HioPfH8bny6xoq+TYDlHfeJrdIYt9bD4CmiKCqijnOK403ZNeIrOoXR8E8dAq6mgw/WN3/qRa9gIhYqZ2kSLF4Q4Cah9H5EaJpSBhG5v/RRoF36HZV8JWa5FssaOV2wI0SjL7g9kUwr8JdNrTSMmfavR8gyQWrt3TF2bz4/Zb4PgsoXB4LZRFFdn3WCmnP6A19g+eZ0q9wOdCQfPmgV9vTBwQEbL8Kk6igSuYF7v85PVunIlbQ8L1BpB6N1S06ZWNxJx2/ReBr/SSXD9NQWiaRPbjAw2JVdW+ReQKLSf94KAOmJHc8LWkGazDseq/WROySScgwvWBL1hI5ZmsIQ2+hZJs4phpNn6G6pDKaHkGgMDbTgqEDZanUqG2aEL6MHPnieLxd93i0g2NkH1zIWEprQcu9MF/FXVrRFRi1qE8OszBPVL1xMlBHy0TKAnmCzaMJMqANIl/y7p5g7uh3fFnAjnrCSFg4XN2x2Mx1SS1HWNkybUacizgx/jbyH7Vb6EGv4GQFOc5G5NNLDlukmfbu5+ogImNzEXslC1M3P5c0Y/DoTgD0o9ZSe/WSnxbHjKT1qZ9BEpgwunKhkdCe7xynmtMdso4DHXZslKAIIobUY1qgCqgzXqKc5Luefe3R1LzGC+Z7yg5f5MMINY/jJcdcZc1jysJWfHQlnCH7y79OV8u2ZmZmV7L3clhOKKN/31u/tErT+lRmhb+femjyYC0dR9jsyW1ezWajNcljoRkUwD/POjI1Q4VM4PLM6gdjQrlxM7sYm/xKgdY+0JhQBijmRZYFYUtS7e2rxBlxGtyFclgquGjzJ3HRrcF4oh9oR9JU3j/BQeaL0ePpRCDRC/UFHUonbpY3oqcsB1OEImMn4c00ToNijx5mMxzY5a+7Oj+riYgMh0jGmPZxDh5Uer90tJRIyJat/K/0e8yuROjhyODLUuxuCF8KGXFC/KfmkiyOZ7UsJ4ySUApwHlH7mlRcwCEqTYjnhdnIQReXuKCnV2qIOPg9fxwgpncI9GEK1hQMYYgf8ik1tijVVwkSWVTL/MNQeB0MIj2om6MiZOvUo5QCjQrMztp/oUlMxB67I1SSTwtHsKzCbPyXL/RgJP9HiL2Md0sY5b2fZ47EiDQySUB8EGfprolheNQ0IXuF0SHCECv9LnZiGCtq0/dZIg1cSMnPacEQc88YPArKeeRgkmJ5EYxh0zehde4ISLssgLeyyVRP0vpfc47iHHs9ETnilQSCF9YdN6AZA0JJ5bFyMDe42vqI8nBpse2YodDgbUw7FXEPSBxI9q/AgPmiuHQoXXyfkBTVoy15I7WNK/FbVyUlgYmsmzuCVA0rdvciPdGxrInIJSSKNd4uV8xiJ+A+7JClfp7wtqHZX9IiQnxDqRYg8EGx+HkeZo6sq8logzZ2DG5EqMod9elImEL7IwH36YpOa2DzlRfa9B01sPcHlMZhFGAA8qMeEQoR1oN6KHLFzRsUifbbwN7KojsdsSgPh3Frw/mrgEyPadPzRiz2FHmM9xTJygLU7BqKkZnaThtDTwl79cdY6OL7rc00UxcrAZTeT0uckxbdhBRZfNYmxuQ4qAPsJmHr7fAIC8gFQJyloD0QWXCHuK202eLBw/wgS9Q8G7kQBdtmhZemvDEWK+M/mHv+dgr66rhpau7h9mx2gruk+CzglzHNbD7pcENOE2v2sOwQ01nD7iX5sTbzUYNV6uOosOJm6+RcodgSdn+fPyfx43V2zBTIxzgCQoF9T8jZKYkyGqf+cfsMnuvLjbelqOIn1YdVjOBEnCi8Ce/bSHnwo45LLsPMOmNYRyo84nzwkWeanhQxZVb4oX7UQonwcvS9v3NJrcFSpMuuxLP1/Y6ZTiBqYcJmLMPJazrFQvnKL0W06FI+hHUDkjUl4t5OArYMsNR7/K6OfhD20MdnCPOm7I0zOjUnR3j2j0MWu8yzCixdHXwneLh4vKlHZqUIjcHenW2/xAUNs320Bii+eybUlHyYclElLc5S3PkUSKXP7CkMGt4augArS/sBo5QsJ3VEtmq4Xa5htJEZq+VprY0/b1piBkCdhs2ovtLeNytI3u/1R89TenUMBf8iMJ7assEXdMotyQpZGN9Kz3UI4PZpJi8R1K8A3tshyzpBzkDcYyj1zc0oPDMOoIxcOypO3ksJBblPtKEHkCoqvi53WTx1QpuHZYL5gDMKrHEowNr2peisg+mwn28lg/D57KdXLHG6KU+WY4ipvc33DV7V2p/B1m+UJhqQJfN4hQVLcrc9evxeKvmUOHDaCzHFyIs9XNp/q64mxO2+/IxABWTjc8PHDxX+SMAkAo/zcd+aYBCdpXF8EqMG22O7c+DAtZEJY9CSUaOGUtQLhQYa4egkje82nHngFibUEnufxahvhArH9RiGGvkFH6m8B3msLArDF3F+lJ4deLk1YuqISCLcYut4eo6vCL5UcxNPtCiGvtZVeUqOFgtZ3WoAvhqPpTlYEnRLqh8gpcWkX3trauvmB+64oIyeb48GmHlhH8BL6lnAaGY7PzBcIZ7z1uRPFdxWjRALfYy9/9iUR0Umc7RMzK1/86u0gqjs6O/AQFtyIwOcTiMCyj8jXD2dMygZxKbQJCyTgOk7K6fWEpiCVMIQprwhIhMA/a12dIZGECCQ9yXc5epbSPESA/JrAM2TnRTZ+TP43fANn5QZ/HBFn7heRb5A/KxaUXv27NAhnwnYBOWRiaKDJ90ocd/DWmGzFZqo12u68CP5LX+OtQ46cXxxxPg4Vfa7GmShezJJhqO97lnzbQajWn2bxZvLRKuXlSW0ivD1vtBFrtm2XcHHYsC+wbpcjLVa+oEz2Zpxfaf/GMG5qblYyD+18XJ5zj6QYPp0rqmzB302lB5gItuRxbWdaRXQ7gtlG/nMCnTAwxTMmoRsv6sGOUZCJAiyQvy4I23QYPB7GVVb2FFihxvJK6sBlCsV7pFFaiFklxeM+0A7IfkHHEHa2C1uZXTHmXlirhYqA3JLyo5jaDfVVF5TrUMKZ0AsjFjtZShnl8E5ACMFWoL5xvo1Cyy9qSYS2wLEtkAzWCzWEMAB0fThf52GyzwtcVM8mZoZYAqGE8Os72ykB1w8sW7VEmPebquGxG1RC9wxT9zpuiLoqDSOmGCo2R76DM990qthcmitlUm2ehdaCKvQABNiedXCjFlCHae4dl10XjS734dbzyIiO2xykkI7tZnLkrUu7w69mGQ7XHWBgESK20Rtm20YDFRtOJ5PPt6EhUWBU3lgINiKSCxZuwQCNFRARnN68AH0D48cPtgKBsGJbHDyekqBZ0/15Q+ild744D2FZtTPelvfiCeVOdsqb38VqOMDZv6XvVOBgJmRxiBtjIv3hPqzg+ZcUJBxXwpbNmukzRpWmBZKBhZp/MRc0HmLPxbgCqCTDz1kd/Hv1Q/TE4GAk1xvtiX9pBr8hBMlytsR4ktAw2W47fJ4Mbu8qpO5zHg+GdBAzeihxf8gzBWwOAhJhcv9BRAKyahWoVqKa2XvYkJqAkFku3WWmiyJCktOwQFkKnVT/MkrQMnkNEJFuvsbkrhouwMQnsQYHDraXsl0dEVAigC8U92tw7kt+yABSZrK/hDcZrphfKA/ItjGH0fTTX6gC3ahUtOIsYvRWI7Qdb2rag5HNCGuuJzdwWQvGds/PGY0NwKUG+SVdR6XRcc/xifOvT3qqYeLps4FsIR5g0mfivCN97sfajcmmXDl3YK0lDlq7n1EZvmI0TsxM4o/fNYgv139awuGd+RgGB9+v9+S2E6QrcXkU+IqLqZKFSDT7Oe66UDh7Nom5sh/kkoLJ4DMMJPQiEG94mrkXf5zcsEgu7H37ZTSH6bpsuy81GPJmmnWjRI4S54DOzQqcNICkR4Ps1LmTzgyYbp2CtpoZBAvbVKlkoCCqgV4rCBFuIc+Rz8EzmMZ+l5R7DRT844pmRYLw2QU8bLJWMk2NMAORdspDhnoKD2jTW8huHwsJ50F8Gd75hka1Pyp1/ddwUiTQCxz9aA3oJjUh8oCOzKD0nDBtDL6fPvnGHvE2zwrT9Aw1m/E7+aUp9JLRTwowmHykf8boEpZp5ORC3ntYexeM98+NC5V+wjAdDdUD4lXKJxEq/WFwgp1xJgvRBVuzh1XRWT4HmBdZo2m7OWg0QJDEy74ZFrqhuxf00YVlwIFlzH7Yxyg4i6XkFRsveT1jAQI4hZRFTz3bzOT0RveDaK93uo33GcyoM85owiLVXK2ESQmSbgfG0TAiWE3iKV0aM1EJoxbmokgzmEw3uc57Aa/Frv15iO6lORRNTd4oSpaALmMpSO7e+kQ6ALLnJL3SkmDG8aSPnMdG6AbUiofBS+q3pnnxtmD7qLIQmNJNQANINq0jWPzo0GOKaPd44Ry3NGCEx9gHyOFNkvRjwzAG3yRKhz9q7VaXGcPKbA79dFnLOHX6V23XbrH/M/6I40JaZc+R6z6TDlaj0dk9tqaCmfdSaBTIBNdUnGhlYo08GyVzjE8fTXitsRa7JICDeeuay02BHFSoeynH3mEfry9upa8lTkf0ibgobA7p0eBB/2A8aDff0rRZPjEq4FB6VwEL6lI6Lz08sfU0oeRS4DfhsAGCxVvvvP1pPXrGDyijWVHauSRecL5Vbvry3Frn8Gsr0R1IMtL2zFss6Ju4b8ACq9Ly83uUgX8GE6F47c+epXPNlKlYzl0h6nAVGEacNI9jC0ppSWlWe27snZYsUIPfBjfMVSv0tvqtR58bKTnOOjBOrMr5oX0EUbgryvqRUF9raKB1esytMzYPel0QEbxZhBOQoAT/mcrzsU3qJ03BXQ9R7kMLIFl5idb2WbXRf2jR9s822mHv0F1Om/h+CwM2tHXZl03YHuiLrhd2hZnplrjeeBUr5HrexQR6wqBGxy8+Exe9LC4Ixkpzxz7KOKbrdn0NvyPAPkI54zd7GlzEkI3CEgg9bDkMejRYJ/FvWKNY5dGbs4rE+dZ/U7fy7X4pL5yJxus1tTsEys8B0Ky79V62m9mUeuF/aAPXTLRJfF4a+pV3gYFOcRwAPGsOPcBQ6KQAMJixlmxuKpAAH7fOqv1Rk+DswpuEoYAme+tl7UmFZS/M/SBcKyGIooNPAgJPJyeKnurFQt8k0q57ilQhAUkRDBTNTq0LQ8cOmuSbRi/qAdVEzsD7Y+CAXwV4+BxxXFv9Krr4aynzMfnpD93RPS9hIBDgQkCOyaeBfZ7lQHUA7psjX+DyHblaG+NVL5SapOHjKGH4Ydz8D7DS+H1kDUOFO9hgUG0tA8DArlnWxcAIb2csd65sOycFI1NPw4dAAHljhmpYN/uFADqlrOdO7o/VXat2DRP9Z0uCv8aM/dSZy+UD3PYycD+voBsUmSq5D6RZArNdLlSiPQzYBGo8pbV1TLPG4WgBj4tM3xgRsFJR+m/USa6ActVzEjpm9oWyCtxREnjw2rZGqQBIteZvviL5gkf9eyag4kQgH7Qdq/xAo3q1tc/LBcBkjwVKnUSPFUFKJ9L2Nq4w57zHAwxUHfFaHwED0NKSXwwJ3+RpQzf42ZUA86Rr1+y9KLihQCJoh7VjtZGAORkd/IzyJEXV3zsN8PtuFhiyYbAC3qpuSlynNyFvSeymfnmwf/sHFeouvQGpKz9mKphjocqmypQ0TCy2MozJ68aYlAbEDp6cQ7BuMz7XXiMsvvlaK/+rl+HaD3T9dCVAD1lvkKLhKhV3LJrxlGYgBEfX9nCRRFMIz7wgEMx4z+M+pdS27AgVatxIQvHw6K8jyH8dYEAj3mkTVxFApd9JTyM/To+Ta4LeqsT+V9aIADxHJuvrIv5575Ty6JHGqQoa2/KieXRcPljQAG00iOcilrGjanhYb4l9HqPsybf83HHBFgWR/i9OV+2sSNKVn8Hc7t++sx+TjoctwBu0EBXb0B6K2mZYO1sJ5gcRaQxCwUA9ChV02Dz/i0+1EeP1nHGXCpuf+BAi7FGNp8gHcmKAyuwvn5CdRVyhi5tZdj9yAR0evpy1VZCBkm/ljml+HTGX0m3XPxBlSbQdYd3P74N3x1YhADsEGz6kU85M7fGDr6z2gqqPm9p/MlCVIEnYNrZcDW5RY4wgJ7+tP46Nf0A0aTqVUMjvPNsalSNtOxxDfh5VfsXEiX61DYm8MdQeG0dYn5ngwFKSSyb3qYRr4fFiy7PSwAuTvCOwRfWFcZbUkBRQb7NgvT6DZUMprPCgdGOIR/J/NPYzXnbnjHpxf8gRlLaFwYAkO6XyNZoLSNuPUjg9dvFUCHQAAA=",
    "name": "Adma",
    "bestSeason": "Oct-Apr",
    "description": "Adma is a lesser-known destination within the Buxa landscape offering offbeat forest tourism experiences.",
    "gallery": [],
    "id": "Adma",
    "isHiddenGem": true
  },
  {
    "description": "Ahaldara is a stunning viewpoint destination offering panoramic views of Kanchenjunga, Teesta Valley, and surrounding hills.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Ahaldara",
    "gallery": [],
    "id": "Ahaldara",
    "tourismType": "Viewpoint, Nature, Photography"
  },
  {
    "isHiddenGem": false,
    "isPopularDestination": true,
    "gallery": [],
    "id": "Algarah",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Algarah",
    "description": "Algarah is a hill town known for scenic landscapes, colonial-era history, and access to nearby villages and viewpoints.",
    "isFeaturedThisWeek": false,
    "tourismType": "Heritage, Nature"
  },
  {
    "description": "Alipurduar is the gateway to the eastern Dooars and serves as the primary access point to Buxa Tiger Reserve, Jayanti, and several wildlife destinations.",
    "bestSeason": "Oct-Apr",
    "name": "Alipurduar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Alipurduar",
    "tourismType": "Gateway, Nature, Wildlife",
    "gallery": []
  },
  {
    "gallery": [],
    "tourismType": "Tea Tourism, Nature",
    "id": "Ambootia",
    "description": "A picturesque tea estate destination surrounded by rolling hills, forests and panoramic Himalayan scenery.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Ambootia",
    "bestSeason": "Oct?May"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Ambotia",
    "bestSeason": "Oct-May",
    "description": "Ambotia is a picturesque tea garden destination offering stunning views of valleys, forests, and traditional tea estates.",
    "gallery": [],
    "id": "Ambotia",
    "tourismType": "Tea Tourism, Nature"
  },
  {
    "isHiddenGem": false,
    "isPopularDestination": true,
    "id": "Arya",
    "gallery": [],
    "name": "Arya",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A picturesque tea garden area known for rolling hills, tea plantations and tranquil surroundings.",
    "isFeaturedThisWeek": false,
    "tourismType": "Tea Tourism"
  },
  {
    "name": "Badamtam",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A historic tea garden destination offering breathtaking valley views and classic Darjeeling tea heritage.",
    "id": "Badamtam",
    "tourismType": "Tea Tourism",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Bagdogra",
    "tourismType": "Gateway, Transit Tourism",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Bagdogra",
    "bestSeason": "All Year",
    "description": "Home to North Bengal's busiest airport, connecting visitors to the Himalayan foothills, Dooars and neighboring countries."
  },
  {
    "isHiddenGem": false,
    "isPopularDestination": true,
    "id": "Bagora",
    "gallery": [],
    "name": "Bagora",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Bagora is an offbeat hill destination surrounded by forests, tea gardens, and mountain landscapes, ideal for peaceful retreats.",
    "isFeaturedThisWeek": false,
    "tourismType": "Offbeat, Nature, Village Tourism"
  },
  {
    "name": "Bagrakote",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Bagrakote is a scenic tea garden region known for plantations, forest views, and easy access to nearby eco-tourism destinations.",
    "tourismType": "Tea Tourism, Nature",
    "id": "Bagrakote",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Ballalguri",
    "tourismType": "Village Tourism, Nature",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Ballalguri",
    "bestSeason": "Oct-Apr",
    "description": "Ballalguri is a scenic rural destination near Totopara known for forests, rivers, and peaceful landscapes."
  },
  {
    "id": "Balurghat",
    "tourismType": "Heritage, Cultural Tourism",
    "gallery": [],
    "description": "Balurghat is the district headquarters of Dakshin Dinajpur and serves as the cultural and administrative center of the region. It offers heritage sites, river landscapes, and access to nearby historical attractions.",
    "bestSeason": "Oct-Mar",
    "name": "Balurghat",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Baneswar",
    "tourismType": "Religious Tourism, Heritage",
    "gallery": [],
    "description": "Baneswar is a famous pilgrimage destination known for the historic Baneswar Shiva Temple and sacred pond with turtles.",
    "name": "Baneswar",
    "bestSeason": "Oct-Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Bangarh",
    "tourismType": "Archaeology, Heritage",
    "description": "Bangarh is one of the oldest archaeological sites in North Bengal, containing the remains of an ancient city with immense historical significance.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Bangarh",
    "bestSeason": "Oct-Mar"
  },
  {
    "description": "The Bangarh Archaeological Zone preserves ancient ruins and provides insight into the region's rich historical past.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Bangarh Archaeological Zone",
    "gallery": [],
    "id": "Bangarh Archaeological Zone",
    "tourismType": "Archaeology, Heritage"
  },
  {
    "gallery": [],
    "tourismType": "Nature, Tea Tourism",
    "id": "Barobisha",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Barobisha",
    "bestSeason": "Oct-Apr",
    "description": "Barobisha is a peaceful destination known for forests, tea gardens, and access to nearby wildlife areas."
  },
  {
    "description": "Batabari serves as an access point to several wildlife and forest tourism destinations within the Dooars region.",
    "name": "Batabari",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "tourismType": "Forest, Nature",
    "id": "Batabari",
    "gallery": []
  },
  {
    "description": "Bikeybhanjang is the final steep ascent before Sandakphu and serves as an important trekking halt.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Bikeybhanjang",
    "bestSeason": "Mar-May, Oct-Dec",
    "gallery": [],
    "id": "Bikeybhanjang",
    "tourismType": "Trekking, Adventure"
  },
  {
    "id": "Bindu",
    "tourismType": "Border Tourism, Riverside, Nature",
    "gallery": [],
    "description": "Bindu is the last village near the Bhutan border and is famous for river views, forests, and peaceful surroundings.",
    "name": "Bindu",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "The Birding Zone attracts nature enthusiasts with seasonal migratory birds and diverse wetland habitats.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Birding Zone",
    "bestSeason": "Nov-Mar",
    "gallery": [],
    "id": "Birding Zone",
    "tourismType": "Birdwatching, Wildlife"
  },
  {
    "tourismType": "Religious Tourism, Pilgrimage",
    "id": "Bolla",
    "gallery": [],
    "name": "Bolla",
    "bestSeason": "Oct-Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Bolla is a well-known religious destination famous for the Bolla Kali Temple, attracting devotees throughout the year."
  },
  {
    "id": "Buxa Fort",
    "tourismType": "Heritage, Trekking, Adventure",
    "gallery": [],
    "bestSeason": "Oct-Apr",
    "name": "Buxa Fort",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Buxa Fort is a historic hilltop fort known for its freedom movement history, trekking routes, and mountain scenery."
  },
  {
    "gallery": [],
    "tourismType": "Tea Tourism, Heritage",
    "id": "Castleton",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Castleton",
    "bestSeason": "Oct-May",
    "description": "Castleton is a renowned tea estate area famous for premium Darjeeling tea and beautiful Himalayan surroundings."
  },
  {
    "description": "Chalsa is a picturesque Dooars town surrounded by forests, tea gardens, and wildlife reserves, making it an ideal base for exploring the region.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Chalsa",
    "bestSeason": "Oct-Apr",
    "gallery": [],
    "id": "Chalsa",
    "tourismType": "Forest, Tea Tourism, Wildlife"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Changrabandha",
    "bestSeason": "Nov?Feb",
    "description": "An important border destination known for trade, connectivity and cultural interactions.",
    "gallery": [],
    "tourismType": "Border Tourism",
    "id": "Changrabandha"
  },
  {
    "id": "Chapramari",
    "tourismType": "Wildlife, Safari, Forest",
    "gallery": [],
    "description": "Chapramari Wildlife Sanctuary is famous for elephant sightings, forests, and rich biodiversity, attracting wildlife enthusiasts throughout the year.",
    "bestSeason": "Oct-Apr",
    "name": "Chapramari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Charkhole is a scenic mountain village offering panoramic views, peaceful homestays, and untouched natural beauty.",
    "name": "Charkhole",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Charkhole",
    "tourismType": "Village Tourism, Viewpoint",
    "gallery": []
  },
  {
    "bestSeason": "Oct-Apr",
    "name": "Chekamari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Chekamari is a forest tourism destination known for grasslands, wildlife habitats, and safari experiences.",
    "id": "Chekamari",
    "tourismType": "Wildlife, Forest",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Chilapata",
    "tourismType": "Wildlife, Forest, Safari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Chilapata",
    "description": "Chilapata Forest is a famous wildlife destination known for elephants, leopards, ancient ruins, and dense forests."
  },
  {
    "name": "Chimney",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Chimney is a tranquil mountain village known for forests, viewpoints, and serene Himalayan surroundings.",
    "id": "Chimney",
    "tourismType": "Offbeat, Viewpoint, Nature",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Chitrey",
    "tourismType": "Trekking, Monastery, Nature",
    "description": "Chitrey is a scenic mountain hamlet on the Sandakphu trekking route, known for its monastery, forests, and panoramic views.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Mar-May, Oct-Dec",
    "name": "Chitrey"
  },
  {
    "isPopularDestination": false,
    "isHiddenGem": true,
    "gallery": [],
    "id": "Chopra",
    "description": "Chopra is a border-region destination offering rural tourism experiences and access to nearby natural landscapes.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Chopra",
    "tourismType": "Border Tourism, Rural Tourism",
    "isFeaturedThisWeek": false
  },
  {
    "description": "Chuikhim is a scenic hill village offering birdwatching, mountain views, and authentic Himalayan hospitality.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Chuikhim",
    "bestSeason": "Oct-May",
    "gallery": [],
    "id": "Chuikhim",
    "tourismType": "Birdwatching, Village Tourism"
  },
  {
    "tourismType": "Forest, Nature",
    "id": "Chunabhati",
    "gallery": [],
    "name": "Chunabhati",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Chunabhati is a scenic forest settlement near Buxa known for nature tourism and peaceful surroundings."
  },
  {
    "bestSeason": "Oct-Mar",
    "name": "Cooch Behar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Cooch Behar is a historic royal city known for its magnificent palace, temples, heritage architecture, and rich cultural legacy. It is one of the most important heritage tourism destinations in North Bengal.",
    "id": "Cooch Behar",
    "tourismType": "Heritage, Palace, Cultural Tourism",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Cooch Behar Palace",
    "description": "Cooch Behar Palace is the district's most iconic attraction, featuring grand European-style architecture inspired by Buckingham Palace.",
    "gallery": [],
    "id": "Cooch Behar Palace",
    "tourismType": "Palace, Heritage, Architecture"
  },
  {
    "name": "Damdim",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Damdim is a tea garden destination surrounded by forests and hills, offering peaceful stays and plantation tourism experiences.",
    "tourismType": "Tea Tourism, Nature",
    "id": "Damdim",
    "gallery": []
  },
  {
    "id": "Darjeeling",
    "tourismType": "Hill Station, Heritage, Tea Tourism, Viewpoint",
    "gallery": [],
    "description": "Darjeeling is the most iconic hill station in North Bengal, renowned for panoramic Himalayan views, tea gardens, toy train heritage, monasteries, and colonial charm. It serves as the tourism capital of the Eastern Himalayas.",
    "name": "Darjeeling",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Dawaipani",
    "tourismType": "Village Tourism, Viewpoint, Offbeat",
    "description": "Dawaipani is an offbeat mountain village offering panoramic Himalayan views, peaceful homestays, and nature walks.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Dawaipani"
  },
  {
    "description": "Debibari is an important religious site known for traditional festivals, local culture, and spiritual significance.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Debibari",
    "bestSeason": "Oct-Mar",
    "gallery": [],
    "id": "Debibari",
    "tourismType": "Religious Tourism, Cultural Tourism"
  },
  {
    "gallery": [],
    "tourismType": "Viewpoint, Nature, Photography",
    "id": "Delo",
    "description": "Delo is the highest point in Kalimpong and offers spectacular views of the Himalayas, Teesta Valley, and surrounding hills. It is one of the most popular viewpoints in the region.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Delo",
    "bestSeason": "Oct-May"
  },
  {
    "id": "Dhupguri",
    "tourismType": "Transit Tourism, Rural Tourism",
    "gallery": [],
    "description": "Dhupguri is an important transit destination in the Dooars region surrounded by rivers, tea gardens, and agricultural landscapes.",
    "name": "Dhupguri",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Dhupjhora",
    "bestSeason": "Oct-Apr",
    "description": "Dhupjhora is a forest tourism destination near Gorumara, known for eco-tourism activities, safaris, and nature experiences.",
    "gallery": [],
    "id": "Dhupjhora",
    "tourismType": "Eco Tourism, Wildlife"
  },
  {
    "id": "Dinhata",
    "tourismType": "Cultural Tourism, Rural Tourism",
    "gallery": [],
    "description": "Dinhata is an important town in Cooch Behar district known for its cultural significance, rural tourism experiences, and proximity to border regions.",
    "bestSeason": "Oct-Mar",
    "name": "Dinhata",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Durpin",
    "tourismType": "Monastery, Viewpoint, Nature",
    "description": "Durpin is a scenic hilltop destination known for Durpin Monastery, panoramic mountain views, and peaceful surroundings.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Durpin",
    "bestSeason": "Oct-May"
  },
  {
    "id": "Falakata",
    "tourismType": "Transit Tourism, Nature",
    "gallery": [],
    "description": "Falakata is a commercial town providing access to nearby forests, wildlife reserves, and tourism destinations in the Dooars.",
    "name": "Falakata",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Fikkalaygaon is a hidden Himalayan village known for scenic beauty, forests, and authentic rural tourism.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Fikkalaygaon",
    "gallery": [],
    "id": "Fikkalaygaon",
    "tourismType": "Village Tourism, Offbeat"
  },
  {
    "gallery": [],
    "tourismType": "Cultural Tourism, Folk Heritage",
    "id": "Folk Art Zone",
    "description": "The Folk Art Zone highlights local crafts, performances, and traditional artistic expressions of Dakshin Dinajpur.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Folk Art Zone",
    "bestSeason": "Oct-Mar"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Gairibas",
    "bestSeason": "Mar-May, Oct-Dec",
    "description": "Gairibas is a tranquil forest settlement within Singalila National Park, popular among trekkers and wildlife enthusiasts.",
    "gallery": [],
    "id": "Gairibas",
    "tourismType": "Trekking, Forest, Wildlife"
  },
  {
    "gallery": [],
    "id": "Gajoldoba",
    "tourismType": "Birdwatching, Wetland, Nature",
    "description": "Gajoldoba is a major wetland tourism destination famous for migratory birds, boating, and beautiful views of the Teesta Barrage.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Gajoldoba",
    "bestSeason": "Nov-Mar"
  },
  {
    "bestSeason": "Oct-Mar",
    "name": "Gangarampur",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Gangarampur is one of the most historically significant destinations in Dakshin Dinajpur and serves as the gateway to the ancient archaeological site of Bangarh.",
    "id": "Gangarampur",
    "tourismType": "Heritage, Archaeology",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Gayabari",
    "description": "Gayabari is a small hill settlement known for tea gardens and its location along the historic Darjeeling Himalayan Railway route.",
    "gallery": [],
    "id": "Gayabari",
    "tourismType": "Tea Tourism, Heritage"
  },
  {
    "id": "Ghayabari",
    "tourismType": "Tea Tourism",
    "gallery": [],
    "bestSeason": "Oct?May",
    "name": "Ghayabari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A quiet tea garden destination offering fresh mountain air and beautiful valley views."
  },
  {
    "description": "India's highest railway station town, famous for heritage railways, monasteries and mountain views.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Ghum",
    "bestSeason": "Oct?May",
    "gallery": [],
    "tourismType": "Heritage & Scenic",
    "id": "Ghum"
  },
  {
    "description": "A beautiful riverside village near Kalimpong known for lush greenery and tranquil surroundings.",
    "name": "Gitdubling",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Gitdubling",
    "tourismType": "Nature Tourism",
    "gallery": []
  },
  {
    "description": "Goalpokhar is a countryside destination known for rural landscapes, local traditions, and agricultural heritage.",
    "name": "Goalpokhar",
    "bestSeason": "Oct-Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Goalpokhar",
    "tourismType": "Rural Tourism, Nature",
    "gallery": []
  },
  {
    "name": "Gopaldhara",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Gopaldhara is a famous tea estate area offering scenic tea gardens, mountain views, and opportunities to experience tea tourism.",
    "tourismType": "Tea Tourism, Scenic Landscape",
    "id": "Gopaldhara",
    "gallery": []
  },
  {
    "description": "Gorkhey is a beautiful riverside village surrounded by forests and mountains, often visited by trekkers exploring Singalila.",
    "bestSeason": "Mar-May, Oct-Dec",
    "name": "Gorkhey",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Gorkhey",
    "tourismType": "Village Tourism, Trekking, Riverside",
    "gallery": []
  },
  {
    "tourismType": "Nature, Forest, Tea Tourism",
    "id": "Gorubathan",
    "gallery": [],
    "description": "Gorubathan is a scenic foothill destination surrounded by forests, rivers, and tea gardens, popular among nature lovers.",
    "name": "Gorubathan",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Gorumara",
    "tourismType": "Wildlife, Safari, Forest",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Gorumara",
    "description": "Gorumara is one of the most famous national parks in Eastern India, known for Indian one-horned rhinoceros, elephants, bison, and rich biodiversity."
  },
  {
    "description": "Haripur is a peaceful countryside destination known for village life, natural beauty, and rural tourism experiences.",
    "bestSeason": "Oct-Mar",
    "name": "Haripur",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Haripur",
    "tourismType": "Rural Tourism, Nature",
    "gallery": []
  },
  {
    "description": "Hasimara is an important transit destination in the Dooars and serves as a gateway to Jaldapara, Bhutan, and nearby wildlife attractions.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Hasimara",
    "gallery": [],
    "id": "Hasimara",
    "tourismType": "Gateway, Transit Tourism"
  },
  {
    "id": "Hemtabad",
    "tourismType": "Heritage & Rural",
    "gallery": [],
    "bestSeason": "Nov?Feb",
    "name": "Hemtabad",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A culturally rich destination known for historical significance and rural landscapes."
  },
  {
    "id": "Heritage Exploration Area",
    "tourismType": "Heritage, Archaeology",
    "gallery": [],
    "name": "Heritage Exploration Area",
    "bestSeason": "Oct-Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "This heritage zone allows visitors to explore ancient structures, historical remains, and archaeological landscapes."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Hili",
    "bestSeason": "Oct-Mar",
    "description": "Hili is an important border destination located on the India?Bangladesh border and offers unique cross-border tourism experiences.",
    "gallery": [],
    "tourismType": "Border Tourism, Cultural Tourism",
    "id": "Hili"
  },
  {
    "gallery": [],
    "id": "Hollong",
    "tourismType": "Wildlife, Safari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Hollong",
    "description": "Hollong is the most famous wildlife tourism zone within Jaldapara and offers exceptional opportunities for wildlife sightings."
  },
  {
    "gallery": [],
    "id": "Icchey Gaon",
    "tourismType": "Village Tourism, Offbeat",
    "description": "Icchey Gaon is a charming village destination offering peaceful stays, forest walks, and panoramic Himalayan vistas.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Icchey Gaon",
    "bestSeason": "Oct-May"
  },
  {
    "description": "Islampur is an important commercial and transit hub in North Bengal, connecting several districts and neighboring states.",
    "bestSeason": "Oct-Mar",
    "name": "Islampur",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Islampur",
    "tourismType": "Transit Tourism, Urban Tourism",
    "gallery": []
  },
  {
    "description": "Itahar is a rural destination offering agricultural landscapes, local culture, and a glimpse into traditional North Bengal village life.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Itahar",
    "gallery": [],
    "id": "Itahar",
    "tourismType": "Rural Tourism, Cultural Tourism"
  },
  {
    "tourismType": "Border Tourism, Transit Tourism",
    "id": "Jaigaon",
    "gallery": [],
    "description": "Jaigaon is a bustling border town adjacent to Bhutan and serves as the gateway to Phuentsholing and international tourism.",
    "name": "Jaigaon",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Jalapahar",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A scenic ridge offering magnificent Himalayan views, colonial heritage and peaceful surroundings.",
    "tourismType": "Heritage & Viewpoint",
    "id": "Jalapahar",
    "gallery": []
  },
  {
    "bestSeason": "Oct-Apr",
    "name": "Jaldapara",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Jaldapara National Park is one of India's premier wildlife destinations, famous for Indian one-horned rhinoceros, elephants, bison, and jeep safaris.",
    "id": "Jaldapara",
    "tourismType": "Wildlife, Safari, National Park",
    "gallery": []
  },
  {
    "id": "Jaldhaka",
    "tourismType": "Nature & Riverside",
    "gallery": [],
    "name": "Jaldhaka",
    "bestSeason": "Oct?Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A scenic river valley destination known for hydel projects, forests and picturesque landscapes."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Jalpaiguri",
    "description": "Jalpaiguri serves as an important gateway to the Dooars region and is known for its rivers, heritage landmarks, and access to wildlife destinations.",
    "gallery": [],
    "id": "Jalpaiguri",
    "tourismType": "Gateway, Heritage, Nature"
  },
  {
    "id": "Jayanti",
    "tourismType": "Wildlife, Riverside, Nature",
    "gallery": [],
    "name": "Jayanti",
    "bestSeason": "Oct?Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A stunning riverside destination on the edge of Buxa Tiger Reserve, known for forests, wildlife and dramatic mountain backdrops."
  },
  {
    "name": "Jhalong",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Jhalong is a riverside destination located on the Jaldhaka River and is known for scenic landscapes, hydro projects, and nature tourism.",
    "id": "Jhalong",
    "tourismType": "Riverside, Nature",
    "gallery": []
  },
  {
    "gallery": [],
    "tourismType": "Rural Tourism",
    "id": "Jhepi",
    "description": "A peaceful countryside location known for natural surroundings and local culture.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Jhepi",
    "bestSeason": "Oct?Mar"
  },
  {
    "gallery": [],
    "id": "Jogighat",
    "tourismType": "Riverside, Nature, Village Tourism",
    "description": "Jogighat is a riverside destination surrounded by forests and villages, offering peaceful nature-based tourism experiences.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Jogighat",
    "bestSeason": "Oct-May"
  },
  {
    "description": "Kafer is a ridge-top destination offering spectacular Himalayan views, peaceful surroundings, and excellent photography opportunities.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Kafer",
    "gallery": [],
    "id": "Kafer",
    "tourismType": "Viewpoint, Nature, Photography"
  },
  {
    "name": "Kaiyakatta",
    "bestSeason": "Oct?Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A peaceful riverside settlement offering rural charm, scenic landscapes and easy access to the Dooars countryside.",
    "id": "Kaiyakatta",
    "tourismType": "Rural Tourism",
    "gallery": []
  },
  {
    "description": "Kalchini is known for tea gardens, forests, and its proximity to Buxa Tiger Reserve, making it a popular eco-tourism destination.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Kalchini",
    "bestSeason": "Oct-Apr",
    "gallery": [],
    "tourismType": "Tea Tourism, Forest, Nature",
    "id": "Kalchini"
  },
  {
    "tourismType": "Cultural Tourism, Heritage",
    "id": "Kaliaganj",
    "gallery": [],
    "name": "Kaliaganj",
    "bestSeason": "Oct-Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Kaliaganj is a historic town known for its cultural heritage, local markets, and traditional North Bengal lifestyle."
  },
  {
    "gallery": [],
    "tourismType": "Hill Station, Heritage, Viewpoint",
    "id": "Kalimpong",
    "description": "Kalimpong is a vibrant Himalayan destination known for panoramic viewpoints, monasteries, colonial heritage, flower nurseries, and easy access to several offbeat villages. It serves as one of the major tourism hubs of North Bengal.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Kalimpong",
    "bestSeason": "Oct-May"
  },
  {
    "description": "Kalipokhri is a high-altitude village known for its sacred black lake and its position on the Sandakphu trekking trail.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Kalipokhri",
    "bestSeason": "Mar-May, Oct-Dec",
    "gallery": [],
    "tourismType": "Trekking, Lake, Spiritual Tourism",
    "id": "Kalipokhri"
  },
  {
    "description": "Kamakhyaguri is an important transit hub connecting various destinations in eastern Dooars and surrounding regions.",
    "name": "Kamakhyaguri",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Kamakhyaguri",
    "tourismType": "Transit Tourism",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Karandighi",
    "bestSeason": "Oct-Mar",
    "description": "Karandighi is known for wetlands, natural landscapes, and peaceful rural surroundings.",
    "gallery": [],
    "id": "Karandighi",
    "tourismType": "Wetland, Nature Tourism"
  },
  {
    "gallery": [],
    "tourismType": "Wildlife, Forest",
    "id": "Khunia",
    "description": "Khunia is known for its forest landscapes and wildlife tourism opportunities within the Gorumara ecosystem.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Khunia",
    "bestSeason": "Oct-Apr"
  },
  {
    "gallery": [],
    "id": "Kodalbasti",
    "tourismType": "Eco Tourism, Wildlife",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Kodalbasti",
    "bestSeason": "Oct-Apr",
    "description": "Kodalbasti is a popular eco-tourism destination located near Chilapata Forest, offering jungle stays and wildlife experiences."
  },
  {
    "gallery": [],
    "tourismType": "Eco Tourism, Forest, Nature",
    "id": "Kolakham",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Kolakham",
    "bestSeason": "Oct-Apr",
    "description": "Kolakham is an eco-tourism destination situated on the edge of Neora Valley National Park and is known for mountain views, forests, and waterfalls."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Kranti",
    "description": "Kranti is a peaceful riverside destination known for its natural landscapes and rural tourism experiences.",
    "gallery": [],
    "id": "Kranti",
    "tourismType": "Riverside, Rural Tourism"
  },
  {
    "id": "Kulik",
    "tourismType": "Birdwatching",
    "gallery": [],
    "description": "Home to one of Asia's largest bird sanctuaries and a paradise for birdwatchers.",
    "name": "Kulik",
    "bestSeason": "Nov?Feb",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "tourismType": "Border Tourism, Nature",
    "id": "Kumargram",
    "gallery": [],
    "description": "Kumargram is a scenic destination near the Assam and Bhutan borders, offering forests, rivers, and rural tourism experiences.",
    "name": "Kumargram",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Kurseong is a charming hill town famous for tea estates, colonial heritage, viewpoints, and pleasant weather throughout the year.",
    "bestSeason": "Oct-May",
    "name": "Kurseong",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Kurseong",
    "tourismType": "Hill Station, Heritage, Tea Tourism",
    "gallery": []
  },
  {
    "id": "Kushmandi",
    "tourismType": "Cultural Tourism, Handicrafts",
    "gallery": [],
    "description": "Kushmandi is famous for its traditional wooden mask-making artisans and unique folk culture, making it one of the district's most distinctive cultural destinations.",
    "bestSeason": "Oct-Mar",
    "name": "Kushmandi",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "bestSeason": "Oct-May",
    "name": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Lamahatta is a popular eco-tourism destination featuring pine forests, landscaped gardens, viewpoints, and peaceful natural surroundings.",
    "id": "Lamahatta",
    "tourismType": "Eco Tourism, Forest, Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "tourismType": "Wildlife, Forest, Safari",
    "id": "Lataguri",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Lataguri",
    "bestSeason": "Oct-Apr",
    "description": "Lataguri is the most popular wildlife tourism hub in the Dooars and serves as the primary gateway to Gorumara National Park."
  },
  {
    "gallery": [],
    "id": "Latpanchar",
    "tourismType": "Birdwatching, Wildlife, Nature",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Latpanchar",
    "bestSeason": "Oct-Apr",
    "description": "Latpanchar is a renowned birdwatching destination located on the edge of Mahananda Wildlife Sanctuary."
  },
  {
    "description": "Lava is a mountain town located near Neora Valley National Park, famous for forests, birdwatching, monasteries, and mist-covered landscapes.",
    "name": "Lava",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Lava",
    "tourismType": "Forest, Wildlife, Hill Station",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Lepchajagat",
    "bestSeason": "Oct?Apr",
    "description": "A serene pine-covered retreat known for misty forests, birdlife and magnificent Kanchenjunga views.",
    "gallery": [],
    "tourismType": "Nature & Scenic",
    "id": "Lepchajagat"
  },
  {
    "gallery": [],
    "tourismType": "Trekking, Viewpoint, Village Tourism",
    "id": "Lepchakha",
    "description": "Lepchakha is a remote Himalayan village offering panoramic views of the Dooars plains and a peaceful trekking experience.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Lepchakha",
    "bestSeason": "Oct-Apr"
  },
  {
    "gallery": [],
    "id": "Lingse",
    "tourismType": "Village Tourism, Offbeat",
    "description": "Lingse is an offbeat mountain village known for tranquil surroundings, homestays, and scenic landscapes.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Lingse"
  },
  {
    "id": "Lingsey",
    "tourismType": "Offbeat Tourism",
    "gallery": [],
    "description": "A hidden gem near the Sikkim border known for mountain vistas, forests and village tourism.",
    "name": "Lingsey",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Lingtam is a quiet mountain village offering panoramic views, nature walks, and cultural experiences.",
    "name": "Lingtam",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "tourismType": "Village Tourism, Nature",
    "id": "Lingtam",
    "gallery": []
  },
  {
    "id": "Lolegaon",
    "tourismType": "Forest, Eco Tourism, Viewpoint",
    "gallery": [],
    "name": "Lolegaon",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Lolegaon is a serene forest village known for canopy walks, heritage forests, and beautiful Himalayan scenery."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Madan Mohan Temple Area",
    "description": "Madan Mohan Temple Area is one of the most important religious and cultural centers in Cooch Behar, attracting devotees and tourists alike.",
    "gallery": [],
    "id": "Madan Mohan Temple Area",
    "tourismType": "Religious Tourism, Heritage"
  },
  {
    "description": "Madarihat is the main tourism hub for Jaldapara National Park and is popular among wildlife enthusiasts and safari travelers.",
    "name": "Madarihat",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "tourismType": "Wildlife, Safari, Nature",
    "id": "Madarihat",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Mahakal Cave",
    "tourismType": "Spiritual Tourism",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct?Apr",
    "name": "Mahakal Cave",
    "description": "A sacred cave destination blending spirituality, mythology and natural beauty."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Mahaldiram",
    "description": "Mahaldiram is a scenic ridge-top destination famous for tea gardens, viewpoints, and sunrise views over the Himalayas.",
    "gallery": [],
    "id": "Mahaldiram",
    "tourismType": "Tea Tourism, Viewpoint"
  },
  {
    "gallery": [],
    "id": "Mainaguri",
    "tourismType": "Wetland, Birdwatching",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Mainaguri",
    "bestSeason": "Oct-Apr",
    "description": "Mainaguri is a town known for wetlands, birdlife, and its strategic location near major wildlife destinations."
  },
  {
    "description": "Makaibari is one of India's oldest tea estates and a globally recognized tea tourism destination known for organic tea production.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Makaibari",
    "gallery": [],
    "id": "Makaibari",
    "tourismType": "Tea Tourism, Heritage"
  },
  {
    "gallery": [],
    "tourismType": "Gateway, Tea Tourism",
    "id": "Malbazar",
    "description": "Malbazar is a major commercial and tourism hub in the Dooars, providing access to forests, tea gardens, and eco-tourism destinations.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Malbazar",
    "bestSeason": "Oct-Apr"
  },
  {
    "description": "Manebhanjan is the gateway to the famous Sandakphu trek and serves as the starting point for adventure seekers exploring the Singalila Ridge.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Manebhanjan",
    "bestSeason": "Mar-May, Oct-Dec",
    "gallery": [],
    "id": "Manebhanjan",
    "tourismType": "Trekking, Adventure, Gateway"
  },
  {
    "gallery": [],
    "tourismType": "Viewpoint, Nature",
    "id": "Mankhim",
    "description": "Mankhim is one of the finest viewpoints in the region, overlooking the Teesta Valley and surrounding mountains.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Mankhim",
    "bestSeason": "Oct-May"
  },
  {
    "gallery": [],
    "tourismType": "Tea Tourism, Heritage",
    "id": "Margaret's Hope",
    "description": "Margaret's Hope is a historic tea estate known worldwide for producing some of the finest Darjeeling teas.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Margaret's Hope",
    "bestSeason": "Oct-May"
  },
  {
    "gallery": [],
    "tourismType": "Nature & Wildlife",
    "id": "Mateli",
    "description": "A gateway to the Dooars known for forests, tea gardens and easy access to wildlife destinations.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Mateli",
    "bestSeason": "Oct?Mar"
  },
  {
    "description": "Mathabhanga is known for its rivers, rural landscapes, and traditional North Bengal culture, offering a peaceful travel experience.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Mathabhanga",
    "bestSeason": "Oct-Mar",
    "gallery": [],
    "id": "Mathabhanga",
    "tourismType": "Rural Tourism, Nature"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Meghma",
    "bestSeason": "Mar-May, Oct-Dec",
    "description": "Meghma is one of the highest villages in the Darjeeling Himalayas, offering breathtaking mountain views and unique Indo-Nepal border experiences.",
    "gallery": [],
    "id": "Meghma",
    "tourismType": "Trekking, Border Tourism, Viewpoint"
  },
  {
    "gallery": [],
    "tourismType": "Border Tourism, Rural Tourism",
    "id": "Mekhliganj",
    "description": "Mekhliganj is a border-region destination known for river landscapes, local culture, and access to nearby heritage and nature sites.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Mekhliganj",
    "bestSeason": "Oct-Mar"
  },
  {
    "description": "Mendabari is a forest tourism destination offering access to wildlife habitats, birdwatching areas, and jungle landscapes.",
    "bestSeason": "Oct-Apr",
    "name": "Mendabari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Mendabari",
    "tourismType": "Wildlife, Forest",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Meteli",
    "tourismType": "Forest, Tea Tourism",
    "description": "Meteli is a beautiful Dooars destination known for forests, tea gardens, and proximity to wildlife reserves.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Meteli"
  },
  {
    "id": "Mirik",
    "tourismType": "Lake, Hill Station, Tea Tourism",
    "gallery": [],
    "name": "Mirik",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Mirik is a picturesque hill town centered around Sumendu Lake, surrounded by tea gardens, forests, and orange orchards. It is a popular family destination known for its peaceful atmosphere."
  },
  {
    "description": "Mongpong is a gateway destination on the Teesta River known for birdwatching, forests, and scenic landscapes.",
    "name": "Mongpong",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "tourismType": "Birdwatching, Riverside",
    "id": "Mongpong",
    "gallery": []
  },
  {
    "tourismType": "Heritage, Nature, Plantation Tourism",
    "id": "Mungpoo",
    "gallery": [],
    "description": "Mungpoo is famous for its association with Rabindranath Tagore, cinchona plantations, and scenic mountain landscapes.",
    "name": "Mungpoo",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Munsong",
    "tourismType": "Heritage, Plantation Tourism",
    "gallery": [],
    "name": "Munsong",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Munsong is known for cinchona plantations, colonial heritage, and beautiful mountain scenery."
  },
  {
    "tourismType": "Riverside, Wildlife, Nature",
    "id": "Murti",
    "gallery": [],
    "description": "Murti is a scenic riverside destination famous for its forest surroundings, wildlife experiences, and peaceful natural beauty.",
    "name": "Murti",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "NJP",
    "tourismType": "Gateway, Transit Tourism",
    "gallery": [],
    "description": "The primary railway gateway to North Bengal, serving as the starting point for journeys into the hills, forests and border regions.",
    "bestSeason": "All Year",
    "name": "NJP",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Nagrakata is known for tea gardens, forests, and scenic landscapes, offering a blend of nature and plantation tourism.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Nagrakata",
    "bestSeason": "Oct-Apr",
    "gallery": [],
    "id": "Nagrakata",
    "tourismType": "Tea Tourism, Nature"
  },
  {
    "id": "Nalraja Garh",
    "tourismType": "Heritage, Archaeology, Forest",
    "gallery": [],
    "description": "Nalraja Garh is an ancient archaeological site hidden within the forests of Chilapata, blending history with nature tourism.",
    "name": "Nalraja Garh",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Namthing",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Namthing is a serene eco-tourism destination known for forests, butterflies, orchids, and natural beauty.",
    "id": "Namthing",
    "tourismType": "Eco Tourism, Nature, Wildlife",
    "gallery": []
  },
  {
    "tourismType": "Rural Tourism",
    "id": "Nayabasti",
    "gallery": [],
    "description": "An emerging rural destination offering scenic beauty and authentic local experiences.",
    "name": "Nayabasti",
    "bestSeason": "Oct?Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "A historic Darjeeling locality known for educational institutions and panoramic hill views.",
    "bestSeason": "Oct?May",
    "name": "North Point",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "North Point",
    "tourismType": "Heritage & Scenic",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Odlabari",
    "bestSeason": "Oct-Apr",
    "description": "Odlabari is a foothill destination connecting the Himalayan region with the Dooars and is known for tea estates and scenic surroundings.",
    "gallery": [],
    "tourismType": "Tea Tourism, Nature",
    "id": "Odlabari"
  },
  {
    "tourismType": "Village Tourism, Nature",
    "id": "Pabong",
    "gallery": [],
    "description": "Pabong is a peaceful mountain village ideal for nature lovers seeking scenic landscapes and village experiences.",
    "name": "Pabong",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Pankhasari",
    "tourismType": "Viewpoint, Village Tourism",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Pankhasari",
    "description": "Pankhasari offers spectacular Himalayan views and is ideal for travelers seeking peaceful offbeat experiences."
  },
  {
    "gallery": [],
    "id": "Paren",
    "tourismType": "Eco Tourism, Village Tourism",
    "description": "Paren is an emerging eco-tourism destination known for forests, mountain scenery, and village experiences.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Paren",
    "bestSeason": "Oct-May"
  },
  {
    "description": "Patiram is a peaceful destination known for temples, rural landscapes, and traditional North Bengal culture.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Patiram",
    "bestSeason": "Oct-Mar",
    "gallery": [],
    "id": "Patiram",
    "tourismType": "Religious Tourism, Rural Tourism"
  },
  {
    "name": "Pedong",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Pedong is a historic Himalayan town known for monasteries, heritage sites, viewpoints, and access to several offbeat villages.",
    "id": "Pedong",
    "tourismType": "Heritage, Monastery, Hill Tourism",
    "gallery": []
  },
  {
    "bestSeason": "Oct-May",
    "name": "Peshok",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Peshok is a beautiful valley destination overlooking the Teesta River and is known for scenic drives and tea gardens.",
    "id": "Peshok",
    "tourismType": "Valley Tourism, Tea Tourism, Scenic Drive",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Phalut",
    "bestSeason": "Mar-May, Oct-Dec",
    "description": "Phalut is a remote high-altitude trekking destination known for its unmatched Himalayan panoramas and pristine landscapes.",
    "gallery": [],
    "id": "Phalut",
    "tourismType": "Trekking, Adventure, Viewpoint"
  },
  {
    "gallery": [],
    "id": "Poobong",
    "tourismType": "Offbeat & Nature",
    "description": "A hidden Himalayan hamlet surrounded by forests and tea gardens, perfect for a peaceful escape.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Poobong",
    "bestSeason": "Oct?May"
  },
  {
    "id": "Raiganj",
    "tourismType": "Birdwatching, Heritage, Urban Tourism",
    "gallery": [],
    "description": "Raiganj is the district headquarters of Uttar Dinajpur and is best known for the Kulik Bird Sanctuary, one of Asia's important bird habitats. It serves as the cultural and tourism center of the district.",
    "bestSeason": "Nov-Mar",
    "name": "Raiganj",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "bestSeason": "Oct-Apr",
    "name": "Rajabhatkhawa",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Rajabhatkhawa is the gateway to Buxa Tiger Reserve and is famous for forests, nature interpretation centers, and wildlife tourism.",
    "id": "Rajabhatkhawa",
    "tourismType": "Wildlife, Forest, Eco Tourism",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Rajbanshi Cultural Belt",
    "tourismType": "Cultural Tourism, Ethnic Tourism",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Rajbanshi Cultural Belt",
    "description": "The Rajbanshi Cultural Belt showcases the traditions, festivals, music, and heritage of one of North Bengal's major communities."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Ramdhura",
    "bestSeason": "Oct-May",
    "description": "Ramdhura is a picturesque Himalayan village known for homestays, orange orchards, and panoramic views of the surrounding mountains.",
    "gallery": [],
    "id": "Ramdhura",
    "tourismType": "Village Tourism, Nature"
  },
  {
    "gallery": [],
    "id": "Rammam",
    "tourismType": "Village Tourism, Nature, Trekking",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Rammam",
    "bestSeason": "Mar-May, Oct-Dec",
    "description": "Rammam is a scenic Himalayan village known for rivers, forests, and peaceful rural tourism experiences."
  },
  {
    "name": "Rangbull",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A charming hill settlement surrounded by tea gardens and panoramic Himalayan landscapes.",
    "id": "Rangbull",
    "tourismType": "Nature & Tea",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Nov-Mar",
    "name": "Rasik Beel",
    "description": "Rasik Beel is one of North Bengal's most important wetland ecosystems, famous for migratory birds, boating, and nature tourism.",
    "gallery": [],
    "id": "Rasik Beel",
    "tourismType": "Birdwatching, Wetland, Nature"
  },
  {
    "gallery": [],
    "id": "Reshi",
    "tourismType": "Riverside, Camping, Nature",
    "description": "Reshi is a riverside destination popular for camping, nature retreats, and border tourism experiences.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Reshi",
    "bestSeason": "Oct-May"
  },
  {
    "id": "Reshikhola",
    "tourismType": "Riverside & Camping",
    "gallery": [],
    "bestSeason": "Oct?May",
    "name": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A riverside paradise on the Bengal-Sikkim border famous for camping, fishing and nature retreats."
  },
  {
    "name": "Rikisum",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Rikisum is a remote mountain village famous for sunrise views, forests, and peaceful Himalayan landscapes.",
    "id": "Rikisum",
    "tourismType": "Viewpoint, Village Tourism",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct?May",
    "name": "Rimbik",
    "description": "Gateway to the Singalila region, famous for trekking routes, mountain views and traditional Himalayan villages.",
    "gallery": [],
    "id": "Rimbik",
    "tourismType": "Trekking & Nature"
  },
  {
    "id": "Rishop",
    "tourismType": "Viewpoint, Village Tourism, Nature",
    "gallery": [],
    "bestSeason": "Oct-May",
    "name": "Rishop",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Rishop is a quiet mountain village offering magnificent Kanchenjunga views, forest trails, and peaceful homestay experiences."
  },
  {
    "description": "Rocky Island is a picturesque riverside destination known for boulders, forest scenery, adventure activities, and camping opportunities.",
    "name": "Rocky Island",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Rocky Island",
    "tourismType": "Riverside, Adventure, Nature",
    "gallery": []
  },
  {
    "gallery": [],
    "tourismType": "Forest, Nature, Scenic Drive",
    "id": "Rohini",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Rohini",
    "bestSeason": "Oct-May",
    "description": "Rohini is a forested foothill destination located on the route to Kurseong, offering scenic drives and nature experiences."
  },
  {
    "id": "Rongli",
    "tourismType": "Transit Tourism, Nature",
    "gallery": [],
    "description": "Rongli is an important gateway destination connecting Kalimpong and East Sikkim, offering river and mountain views.",
    "name": "Rongli",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "tourismType": "Rural Tourism",
    "id": "Sabargram",
    "gallery": [],
    "description": "A tranquil village surrounded by greenery, ideal for experiencing authentic North Bengal culture and nature.",
    "name": "Sabargram",
    "bestSeason": "Oct?Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Sagar Dighi is a historic waterbody located in the heart of Cooch Behar and is popular for recreation, photography, and local gatherings.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Sagar Dighi",
    "gallery": [],
    "id": "Sagar Dighi",
    "tourismType": "Heritage, Urban Tourism"
  },
  {
    "id": "Samsing",
    "tourismType": "Nature, Tea Tourism, Eco Tourism",
    "gallery": [],
    "name": "Samsing",
    "bestSeason": "Oct-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Samsing is one of the most scenic destinations in the Dooars, famous for tea gardens, forests, and mountain landscapes."
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Sandakphu",
    "bestSeason": "Mar-May, Oct-Dec",
    "description": "Sandakphu is the highest point in West Bengal, offering spectacular views of Everest, Kanchenjunga, Makalu, and Lhotse.",
    "gallery": [],
    "tourismType": "Trekking, Adventure, Viewpoint",
    "id": "Sandakphu"
  },
  {
    "bestSeason": "Oct-Apr",
    "name": "Santalabari",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Santalabari serves as the starting point for treks to Buxa Fort and Lepchakha, attracting adventure enthusiasts.",
    "id": "Santalabari",
    "tourismType": "Trekking, Adventure",
    "gallery": []
  },
  {
    "description": "Sevoke is known for the iconic Coronation Bridge, Teesta River views, and its strategic location connecting the plains to the hills.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-May",
    "name": "Sevoke Corridor",
    "gallery": [],
    "id": "Sevoke Corridor",
    "tourismType": "Heritage, Riverside, Scenic Drive"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Siddheshwari",
    "bestSeason": "Oct?Mar",
    "description": "A culturally significant destination known for temples and local heritage.",
    "gallery": [],
    "id": "Siddheshwari",
    "tourismType": "Religious Tourism"
  },
  {
    "gallery": [],
    "id": "Siliguri",
    "tourismType": "Gateway, Urban Tourism",
    "description": "The vibrant gateway to North Bengal, connecting travelers to Darjeeling, Dooars, Sikkim, Nepal, Bhutan and the Eastern Himalayas.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Siliguri",
    "bestSeason": "Oct?Mar"
  },
  {
    "gallery": [],
    "id": "Sillery Gaon",
    "tourismType": "Village Tourism, Viewpoint, Offbeat",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Sillery Gaon",
    "bestSeason": "Oct-May",
    "description": "Sillery Gaon is a popular offbeat destination known for breathtaking mountain views, pine forests, and peaceful village life."
  },
  {
    "name": "Simana",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Simana is a popular viewpoint and border destination offering breathtaking views of the surrounding hills and Nepal border region.",
    "id": "Simana",
    "tourismType": "Viewpoint, Border Tourism",
    "gallery": []
  },
  {
    "description": "A scenic riverside valley connecting Darjeeling and Kalimpong, known for adventure and natural beauty.",
    "name": "Singla",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Singla",
    "tourismType": "Adventure & Nature",
    "gallery": []
  },
  {
    "id": "Singtom",
    "tourismType": "Tea & Heritage",
    "gallery": [],
    "description": "One of Darjeeling's oldest tea estates, blending colonial heritage with stunning mountain scenery.",
    "bestSeason": "Oct?May",
    "name": "Singtom",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Sitai",
    "bestSeason": "Nov?Feb",
    "description": "A borderland destination rich in rural culture, wetlands and traditional lifestyles.",
    "gallery": [],
    "id": "Sitai",
    "tourismType": "Rural & Cultural"
  },
  {
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Sitalkuchi",
    "bestSeason": "Oct-Mar",
    "description": "Sitalkuchi is a rural destination offering agricultural landscapes, village experiences, and local cultural tourism opportunities.",
    "gallery": [],
    "id": "Sitalkuchi",
    "tourismType": "Rural Tourism, Cultural Tourism"
  },
  {
    "description": "Sittong is widely known as the Orange Village of Darjeeling and attracts visitors with orchards, forests, and mountain scenery.",
    "name": "Sittong",
    "bestSeason": "Nov-Apr",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "tourismType": "Village Tourism, Orchard Tourism, Nature",
    "id": "Sittong",
    "gallery": []
  },
  {
    "id": "Sonada",
    "tourismType": "Nature & Culture",
    "gallery": [],
    "bestSeason": "Oct?May",
    "name": "Sonada",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "A peaceful hill town known for monasteries, tea gardens and scenic Himalayan landscapes."
  },
  {
    "description": "Soureni is a scenic tea garden destination near Mirik offering tranquil landscapes, rolling tea estates, and authentic rural Himalayan experiences.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "name": "Soureni",
    "bestSeason": "Oct-May",
    "gallery": [],
    "tourismType": "Tea Tourism, Village Tourism, Nature",
    "id": "Soureni"
  },
  {
    "description": "Srikhola is a charming riverside settlement famous for its suspension bridge, river views, and trekking stopovers.",
    "bestSeason": "Mar-May, Oct-Dec",
    "name": "Srikhola",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Srikhola",
    "tourismType": "Riverside, Trekking, Nature",
    "gallery": []
  },
  {
    "id": "Sukhiapokhri",
    "tourismType": "Nature & Trekking",
    "gallery": [],
    "description": "A popular hill destination known for proximity to Sandakphu, forests and Himalayan panoramas.",
    "name": "Sukhiapokhri",
    "bestSeason": "Oct?May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Suntalekhola",
    "tourismType": "Eco Tourism, Forest, Riverside",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Suntalekhola",
    "description": "Suntalekhola is a tranquil forest destination known for hanging bridges, streams, forests, and eco-tourism experiences."
  },
  {
    "description": "Takdah is a historic cantonment town known for colonial bungalows, tea gardens, forests, and offbeat tourism experiences.",
    "name": "Takdah",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "id": "Takdah",
    "tourismType": "Heritage, Tea Tourism, Offbeat",
    "gallery": []
  },
  {
    "name": "Tangta",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Tangta is a peaceful Himalayan settlement offering scenic beauty, traditional lifestyles, and access to border tourism experiences.",
    "tourismType": "Village Tourism, Border Tourism",
    "id": "Tangta",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Tapan",
    "tourismType": "Rural Tourism, Nature",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Tapan",
    "description": "Tapan is known for its rural landscapes, traditional village life, and peaceful countryside environment."
  },
  {
    "description": "An offbeat Himalayan retreat surrounded by forests, rivers and panoramic mountain views.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct?May",
    "name": "Tarkhola",
    "gallery": [],
    "id": "Tarkhola",
    "tourismType": "Offbeat & Nature"
  },
  {
    "name": "Thurbo",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Thurbo is a historic tea estate region known for lush tea gardens, colonial-era heritage, and panoramic mountain scenery.",
    "tourismType": "Tea Tourism, Heritage, Nature",
    "id": "Thurbo",
    "gallery": []
  },
  {
    "id": "Tinchuley",
    "tourismType": "Village Tourism, Viewpoint, Nature",
    "gallery": [],
    "description": "Tinchuley is a charming mountain village famous for homestays, orange orchards, viewpoints, and authentic village tourism.",
    "name": "Tinchuley",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Tingling",
    "tourismType": "Tea Tourism, Offbeat, Village Tourism",
    "gallery": [],
    "bestSeason": "Oct-May",
    "name": "Tingling",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Tingling is a peaceful tea garden settlement surrounded by forests and mountain scenery, ideal for offbeat travelers."
  },
  {
    "id": "Todey",
    "tourismType": "Border Tourism, Nature, Village Tourism",
    "gallery": [],
    "name": "Todey",
    "bestSeason": "Oct-May",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "description": "Todey is a remote mountain destination near the Bhutan border known for forests, cardamom plantations, and rural tourism."
  },
  {
    "gallery": [],
    "id": "Totopara",
    "tourismType": "Tribal Tourism, Cultural Tourism",
    "description": "Totopara is home to the indigenous Toto community and offers a unique blend of tribal culture, nature, and border tourism.",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Apr",
    "name": "Totopara"
  },
  {
    "tourismType": "Wetland, Birdwatching, Nature",
    "id": "Tufanganj",
    "gallery": [],
    "description": "Tufanganj is a gateway to Rasik Beel and surrounding wetlands, attracting birdwatchers and nature enthusiasts.",
    "name": "Tufanganj",
    "bestSeason": "Nov-Mar",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Tumling",
    "tourismType": "Village Tourism, Viewpoint, Trekking",
    "gallery": [],
    "description": "Tumling is a picturesque ridge-top village famous for sunrise views, homestays, and panoramic Himalayan landscapes.",
    "bestSeason": "Mar-May, Oct-Dec",
    "name": "Tumling",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Wooden Mask Village Cluster",
    "tourismType": "Cultural Tourism, Handicrafts",
    "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    "bestSeason": "Oct-Mar",
    "name": "Wooden Mask Village Cluster",
    "description": "This cultural cluster is renowned for traditional wooden mask-making, a unique folk art practiced by local artisans for generations."
  }
];

export const initialAttractions: Attraction[] = [
  {
    "destinationId": "Phalut",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "360? Himalayan View",
    "description": "A panoramic viewpoint offering uninterrupted views of Everest  Kanchenjunga  Makalu  and other major peaks.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "360? Himalayan View_Phalut"
  },
  {
    "gallery": [],
    "id": "Adventure Zone_Delo",
    "category": "Viewpoint",
    "description": "An activity area featuring adventure sports and outdoor recreational experiences.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Delo",
    "name": "Adventure Zone"
  },
  {
    "name": "Agricultural Tourism Areas",
    "destinationId": "Dhupguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Farming landscapes offering agro-tourism experiences.",
    "category": "Viewpoint",
    "id": "Agricultural Tourism Areas_Dhupguri",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Ahal Dara View Corridor_Latpanchar",
    "category": "Viewpoint",
    "description": "Scenic viewpoints near Latpanchar offering panoramic views of the Teesta Valley and Himalayan foothills.",
    "destinationId": "Latpanchar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ahal Dara View Corridor"
  },
  {
    "gallery": [],
    "id": "Ahaldara View Corridor_Sittong",
    "category": "Viewpoint",
    "description": "Scenic viewpoints near the Sittong region offering spectacular views of Kanchenjunga and the Teesta Valley.",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ahaldara View Corridor"
  },
  {
    "category": "Viewpoint",
    "id": "Ahaldara Viewpoint_Ahaldara",
    "gallery": [],
    "name": "Ahaldara Viewpoint",
    "destinationId": "Ahaldara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Ahaldara Viewpoint is one of the finest viewpoints in the Darjeeling foothills  offering sweeping views of Kanchenjunga  the Teesta Valley  and surrounding forests."
  },
  {
    "id": "Algarah Heritage Area_Algarah",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A historic settlement area reflecting the colonial and cultural history of the Kalimpong hills.",
    "name": "Algarah Heritage Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Algarah"
  },
  {
    "description": "A scenic viewpoint offering panoramic views of valleys  forests  and the surrounding Himalayan landscape.",
    "name": "Algarah Viewpoint",
    "destinationId": "Algarah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Algarah Viewpoint_Algarah",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Alipurduar Cultural Centre_Alipurduar",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Venue for local festivals  cultural performances  and community events.",
    "name": "Alipurduar Cultural Centre",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Alipurduar"
  },
  {
    "name": "Alipurduar Junction Railway Station",
    "destinationId": "Alipurduar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "One of the most important railway junctions in North Bengal and gateway to the Dooars.",
    "id": "Alipurduar Junction Railway Station_Alipurduar",
    "category": "Monastery",
    "gallery": []
  },
  {
    "destinationId": "Phalut",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Alpine Landscape",
    "description": "Open alpine terrain with mountain meadows and dramatic Himalayan scenery.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Alpine Landscape_Phalut"
  },
  {
    "description": "Located amidst tea gardens and forests  Ambotia Shiva Temple attracts both pilgrims and nature lovers.",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ambotia Shiva Temple",
    "gallery": [],
    "id": "Ambotia Shiva Temple_Kurseong",
    "category": "Monastery"
  },
  {
    "description": "Ambotia Tea Estate is known for premium Darjeeling tea  rolling plantations  and beautiful Himalayan landscapes.",
    "name": "Ambotia Tea Estate",
    "destinationId": "Ambotia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Ambotia Tea Estate_Ambotia",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Ambotia Tea Estate_Kurseong",
    "category": "Viewpoint",
    "description": "Ambotia Tea Estate offers scenic tea garden landscapes  colonial charm  and opportunities to experience Darjeeling tea culture.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Ambotia Tea Estate"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Amphibian Observation Zone_Namthing",
    "description": "Specialized observation areas for studying amphibians and wetland biodiversity.",
    "destinationId": "Namthing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Amphibian Observation Zone"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Srikhola",
    "name": "Angling Area",
    "description": "Popular stretch of river suitable for recreational angling and nature-based activities.",
    "gallery": [],
    "id": "Angling Area_Srikhola",
    "category": "Viewpoint"
  },
  {
    "id": "Angling Areas_Reshikhola",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Angling Areas",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Select river stretches suitable for recreational fishing and angling activities."
  },
  {
    "id": "Angling Zones_Jhalong",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Angling Zones",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhalong",
    "description": "Selected stretches of the river suitable for recreational fishing and angling activities."
  },
  {
    "name": "Army Golf Area Views",
    "destinationId": "Durpin",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic viewpoints overlooking the golf course  forests  and surrounding hills.",
    "id": "Army Golf Area Views_Durpin",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Arya Tea Estate_Arya",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Arya Tea Estate",
    "destinationId": "Arya",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Well-known Darjeeling tea estate producing premium orthodox teas."
  },
  {
    "id": "Arya Tea Factory_Arya",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Working tea factory associated with estate production and tea processing.",
    "name": "Arya Tea Factory",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Arya"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Arya",
    "name": "Arya Viewpoint",
    "description": "Scenic mountain viewpoint overlooking tea gardens and surrounding hills.",
    "gallery": [],
    "id": "Arya Viewpoint_Arya",
    "category": "Viewpoint"
  },
  {
    "id": "Atrai Riverfront_Balurghat",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Popular riverside area along the Atrai River offering leisure walks and photography opportunities.",
    "name": "Atrai Riverfront",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Balurghat"
  },
  {
    "description": "Colonial-era tea bungalow associated with the estate.",
    "destinationId": "Badamtam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Badamtam Heritage Bungalow",
    "gallery": [],
    "id": "Badamtam Heritage Bungalow_Badamtam",
    "category": "Monastery"
  },
  {
    "gallery": [],
    "id": "Badamtam Tea Estate_Badamtam",
    "category": "Viewpoint",
    "destinationId": "Badamtam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Badamtam Tea Estate",
    "description": "Historic Darjeeling tea estate known for scenic tea gardens and heritage tea production."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Badamtam",
    "name": "Badamtam Valley Viewpoint",
    "description": "Scenic viewpoint overlooking tea gardens and surrounding valleys.",
    "gallery": [],
    "id": "Badamtam Valley Viewpoint_Badamtam",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Bagora Forest Area_Bagora",
    "destinationId": "Bagora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bagora Forest Area",
    "description": "Bagora Forest Area is known for dense forests  mountain scenery  and peaceful offbeat tourism experiences."
  },
  {
    "name": "Bagora Viewpoint",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Bagora Viewpoint is known for panoramic Himalayan scenery  sunrise views  and peaceful surroundings away from crowds.",
    "category": "Viewpoint",
    "id": "Bagora Viewpoint_Kurseong",
    "gallery": []
  },
  {
    "name": "Bala River Confluence Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jayanti",
    "description": "Picturesque river area near Jayanti surrounded by forests and hills.",
    "id": "Bala River Confluence Area_Jayanti",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Balurghat Cultural Centre",
    "destinationId": "Balurghat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Venue for local cultural performances  exhibitions  and events.",
    "id": "Balurghat Cultural Centre_Balurghat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Balurghat District Museum",
    "destinationId": "Balurghat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Museum showcasing regional history  archaeology  culture  and heritage of South Dinajpur.",
    "category": "Viewpoint",
    "id": "Balurghat District Museum_Balurghat",
    "gallery": []
  },
  {
    "description": "Walking and recreation area developed along the riverfront.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Balurghat",
    "name": "Balurghat Riverside Promenade",
    "gallery": [],
    "id": "Balurghat Riverside Promenade_Balurghat",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Balurghat Town Park_Balurghat",
    "category": "Viewpoint",
    "destinationId": "Balurghat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Balurghat Town Park",
    "description": "Major public park and green space within the town."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Icchey Gaon",
    "name": "Bamboo Groves",
    "description": "Dense bamboo groves creating unique natural scenery and supporting local biodiversity.",
    "gallery": [],
    "id": "Bamboo Groves_Icchey Gaon",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Baneswar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Baneswar Fair Ground",
    "description": "Site associated with annual religious gatherings and temple festivals.",
    "gallery": [],
    "id": "Baneswar Fair Ground_Baneswar",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Baneswar Sacred Turtle Pond_Baneswar",
    "category": "Monastery",
    "destinationId": "Baneswar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Baneswar Sacred Turtle Pond",
    "description": "Sacred pond within the temple complex  famous for its protected softshell turtles."
  },
  {
    "id": "Baneswar Shiva Temple_Baneswar",
    "category": "Monastery",
    "gallery": [],
    "description": "Historic Shiva temple and one of the most important pilgrimage sites in the Cooch Behar region.",
    "name": "Baneswar Shiva Temple",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Baneswar"
  },
  {
    "isHiddenGem": true,
    "isFeaturedAttraction": false,
    "category": "Monastery",
    "id": "Baneswar Shiva Temple_Cooch Behar",
    "gallery": [],
    "description": "Historic temple known for its sacred pond and turtles.",
    "name": "Baneswar Shiva Temple",
    "destinationId": "Cooch Behar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "isFeaturedThisWeek": false
  },
  {
    "name": "Baneswar Temple Complex",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Baneswar",
    "description": "Temple precinct including shrines  sacred pond and pilgrimage facilities.",
    "id": "Baneswar Temple Complex_Baneswar",
    "category": "Monastery",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Bangarh Archaeological Site_Bangarh",
    "isFeaturedAttraction": false,
    "isHiddenGem": false,
    "isFeaturedThisWeek": true,
    "destinationId": "Bangarh",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bangarh Archaeological Site",
    "description": "One of the most important archaeological sites in North Bengal  associated with the ancient city of Kotivarsha."
  },
  {
    "description": "Ancient historical site associated with the early kingdoms of Bengal and one of South Dinajpur  s most important heritage attractions.",
    "destinationId": "Gangarampur",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bangarh Archaeological Site",
    "gallery": [],
    "id": "Bangarh Archaeological Site_Gangarampur",
    "category": "Viewpoint"
  },
  {
    "isFeaturedAttraction": true,
    "isHiddenGem": false,
    "gallery": [],
    "category": "Viewpoint",
    "id": "Bangarh Excavation Zone_Bangarh",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bangarh",
    "name": "Bangarh Excavation Zone",
    "description": "Protected excavation area containing remains of ancient settlements and structures.",
    "isFeaturedThisWeek": false
  },
  {
    "id": "Bangarh Heritage Interpretation Area_Bangarh",
    "category": "Monastery",
    "gallery": [],
    "description": "Visitor area explaining the history and significance of the archaeological site.",
    "name": "Bangarh Heritage Interpretation Area",
    "destinationId": "Bangarh",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Bania River Crossing_Chilapata",
    "category": "Viewpoint",
    "isFeaturedAttraction": true,
    "isHiddenGem": false,
    "isFeaturedThisWeek": false,
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chilapata",
    "name": "Bania River Crossing",
    "description": "Scenic forest river section frequently visited during safaris."
  },
  {
    "name": "Barbotey Rock Garden Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "description": "A scenic extension of the Rock Garden region known for natural beauty  streams  and hillside landscapes.",
    "id": "Barbotey Rock Garden Area_Darjeeling",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Barking Deer Habitat_Lepchajagat",
    "category": "Viewpoint",
    "description": "Forest areas where barking deer are occasionally sighted.",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Barking Deer Habitat"
  },
  {
    "category": "Viewpoint",
    "id": "Batabari Safari Gate_Batabari",
    "gallery": [],
    "name": "Batabari Safari Gate",
    "destinationId": "Batabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A major access point for safari operations and wildlife tourism activities."
  },
  {
    "category": "Viewpoint",
    "id": "Batasia Loop Railway Section_Darjeeling",
    "gallery": [],
    "name": "Batasia Loop Railway Section",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "One of the most photographed sections of the Darjeeling Himalayan Railway featuring a spiral loop and mountain views."
  },
  {
    "description": "The Ghoom-side access to Batasia Loop offers excellent views of the toy train route and surrounding Himalayan landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ghum",
    "name": "Batasia Loop View Area",
    "gallery": [],
    "id": "Batasia Loop View Area_Ghum",
    "category": "Viewpoint"
  },
  {
    "description": "Batasia Loop is a famous spiral railway loop featuring landscaped gardens  mountain views  and the Gorkha War Memorial.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "name": "Batasia Loop",
    "gallery": [],
    "id": "Batasia Loop_Darjeeling",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Bengal Natural History Museum_Darjeeling",
    "gallery": [],
    "name": "Bengal Natural History Museum",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "The museum features exhibits on Himalayan biodiversity  wildlife  and regional ecosystems."
  },
  {
    "gallery": [],
    "id": "Bhorer Alo Tourism Complex_Gajoldoba",
    "category": "Viewpoint",
    "description": "A major tourism complex overlooking the Teesta and wetlands  offering visitor facilities and viewpoints.",
    "destinationId": "Gajoldoba",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bhorer Alo Tourism Complex"
  },
  {
    "id": "Bhutan Border Landscapes_Todey",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Bhutan Border Landscapes",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic landscapes near the Bhutan border offering unique cultural and geographical experiences."
  },
  {
    "description": "This historic monastery preserves Buddhist traditions and houses valuable religious manuscripts and artifacts.",
    "name": "Bhutia Busty Monastery",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "id": "Bhutia Busty Monastery_Darjeeling",
    "category": "Monastery",
    "gallery": []
  },
  {
    "id": "Bindu Barrage_Bindu",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Bindu Barrage",
    "destinationId": "Bindu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A famous barrage on the Jaldhaka River near the Indo-Bhutan border  attracting tourists throughout the year."
  },
  {
    "category": "Viewpoint",
    "id": "Bird Observation Areas_Gitdubling",
    "gallery": [],
    "description": "Forest and riverside habitats supporting a variety of Himalayan bird species.",
    "name": "Bird Observation Areas",
    "destinationId": "Gitdubling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Forest and river habitats supporting numerous Himalayan bird species.",
    "name": "Bird Observation Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhalong",
    "id": "Bird Observation Areas_Jhalong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Bird Observation Areas",
    "destinationId": "Rikisum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest habitats supporting a variety of Himalayan bird species and birdwatching opportunities.",
    "id": "Bird Observation Areas_Rikisum",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Bird Observation Areas_Rishop",
    "gallery": [],
    "description": "Forest habitats supporting numerous Himalayan bird species.",
    "name": "Bird Observation Areas",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "category": "Viewpoint",
    "id": "Bird Observation Areas_Tangta",
    "gallery": [],
    "description": "Forest habitats supporting numerous Himalayan bird species.",
    "name": "Bird Observation Areas",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Bird Observation Trails_Dhupjhora",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Trails designed for birdwatchers exploring forest habitats.",
    "name": "Bird Observation Trails",
    "destinationId": "Dhupjhora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Bird Observation Zones_Chalsa",
    "category": "Viewpoint",
    "destinationId": "Chalsa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bird Observation Zones",
    "description": "Forest-edge habitats supporting a wide variety of bird species."
  },
  {
    "name": "Bird Photography Hides",
    "destinationId": "Latpanchar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Popular locations for wildlife photographers seeking rare Himalayan bird species.",
    "category": "Viewpoint",
    "id": "Bird Photography Hides_Latpanchar",
    "gallery": []
  },
  {
    "name": "Bird Watching Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "description": "Kurseong  s forest ecosystem supports diverse Himalayan bird species  making it attractive for birdwatchers.",
    "id": "Bird Watching Areas_Kurseong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Forest habitats supporting a wide variety of Himalayan bird species  making Lepchajagat a birding destination.",
    "name": "Bird Watching Areas",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Bird Watching Areas_Lepchajagat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Forest habitats supporting a variety of Himalayan and migratory bird species.",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bird Watching Areas",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Bird Watching Areas_Paren"
  },
  {
    "id": "Bird Watching Zones_Chapramari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Rich bird habitats attracting resident and migratory species throughout the year.",
    "name": "Bird Watching Zones",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Bird Watching Zones",
    "destinationId": "Latpanchar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Renowned birding areas attracting enthusiasts seeking Himalayan and migratory bird species.",
    "id": "Bird Watching Zones_Latpanchar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lava",
    "name": "Bird Watching Zones",
    "description": "Lava is one of North Bengal  s premier birdwatching destinations with numerous Himalayan species.",
    "gallery": [],
    "id": "Bird Watching Zones_Lava",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Bird Watching Zones_Lingsey",
    "category": "Viewpoint",
    "description": "Forest habitats supporting a variety of Himalayan bird species.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lingsey",
    "name": "Bird Watching Zones"
  },
  {
    "description": "Natural habitats frequented by resident and migratory birds.",
    "name": "Bird Watching Zones",
    "destinationId": "Mateli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Bird Watching Zones_Mateli",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Forest habitats around Mirik support diverse Himalayan bird species  attracting birdwatchers and photographers.",
    "name": "Bird Watching Zones",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Bird Watching Zones_Mirik",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Bird Watching Zones_Mongpong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "One of the most important birding locations in North Bengal  attracting resident and migratory species.",
    "name": "Bird Watching Zones",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mongpong"
  },
  {
    "category": "Viewpoint",
    "id": "Birding Areas_Dawaipani",
    "gallery": [],
    "description": "Forest habitats supporting a variety of Himalayan bird species and birdwatching opportunities.",
    "name": "Birding Areas",
    "destinationId": "Dawaipani",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Birding Zones_Gairibas",
    "destinationId": "Gairibas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Birding Zones",
    "description": "Rich bird habitats supporting many Himalayan bird species."
  },
  {
    "category": "Viewpoint",
    "id": "Boating Area_Mirik",
    "gallery": [],
    "name": "Boating Area",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "The boating zone allows visitors to explore Sumendu Lake while enjoying panoramic views of forests and hills."
  },
  {
    "name": "Boating Zones",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gajoldoba",
    "description": "Designated boating areas offering views of the river  wetlands  and Himalayan foothills.",
    "id": "Boating Zones_Gajoldoba",
    "category": "Waterfall",
    "gallery": []
  },
  {
    "description": "Bokar Monastery is one of the most important Buddhist monasteries in the region  known for its spiritual significance and architecture.",
    "name": "Bokar Monastery",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "id": "Bokar Monastery_Mirik",
    "category": "Monastery",
    "gallery": []
  },
  {
    "name": "Bolla Fair Ground",
    "destinationId": "Bolla",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Ground associated with temple fairs and seasonal religious gatherings.",
    "id": "Bolla Fair Ground_Bolla",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Bolla Kali Temple_Bolla",
    "category": "Monastery",
    "gallery": [],
    "name": "Bolla Kali Temple",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bolla",
    "description": "Famous Kali temple and one of the most important pilgrimage destinations in South Dinajpur."
  },
  {
    "description": "Temple precinct and associated religious structures.",
    "destinationId": "Bolla",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Bolla Temple Complex",
    "gallery": [],
    "category": "Monastery",
    "id": "Bolla Temple Complex_Bolla"
  },
  {
    "gallery": [],
    "id": "Border Observation Point_Hili",
    "category": "Viewpoint",
    "description": "Designated viewing area for observing the international border landscape.",
    "destinationId": "Hili",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Border Observation Point"
  },
  {
    "id": "Border Photography Point_Bindu",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Popular location for capturing river  hills  and border landscapes.",
    "name": "Border Photography Point",
    "destinationId": "Bindu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Border Sunset Point_Simana",
    "category": "Viewpoint",
    "destinationId": "Simana",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Border Sunset Point",
    "description": "One of the best places in the region to enjoy sunset views over the hills and valleys."
  },
  {
    "description": "A scenic trail running along the India?Nepal border.",
    "name": "Border Trail",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tumling",
    "id": "Border Trail_Tumling",
    "category": "Trek",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "British Officers   Bungalows_Takdah",
    "gallery": [],
    "description": "Well-preserved colonial bungalows reflecting the history of British presence in the Darjeeling hills.",
    "name": "British Officers   Bungalows",
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Buddhist Prayer Flag Area_Lava",
    "category": "Monastery",
    "description": "Prayer flag-lined viewpoints creating a peaceful Himalayan atmosphere.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lava",
    "name": "Buddhist Prayer Flag Area"
  },
  {
    "gallery": [],
    "id": "Butterfly Areas_Latpanchar",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "name": "Butterfly Areas",
    "description": "Forest clearings and meadows supporting a rich diversity of butterfly species."
  },
  {
    "description": "Butterfly conservation and viewing area featuring local species.",
    "destinationId": "Rajabhatkhawa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Butterfly Garden",
    "gallery": [],
    "id": "Butterfly Garden_Rajabhatkhawa",
    "category": "Viewpoint"
  },
  {
    "description": "Panoramic viewpoint overlooking the forests and valleys of Buxa.",
    "name": "Buxa Fort Viewpoint",
    "destinationId": "Buxa Fort",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Buxa Fort Viewpoint_Buxa Fort",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Buxa Fort_Buxa Fort",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Buxa Fort",
    "name": "Buxa Fort",
    "description": "Historic hilltop fort used during the British era and later as a detention camp for freedom fighters."
  },
  {
    "destinationId": "Alipurduar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Buxa Road Heritage Zone",
    "description": "Historic railway and trade corridor associated with the development of the Dooars region.",
    "gallery": [],
    "category": "Monastery",
    "id": "Buxa Road Heritage Zone_Alipurduar"
  },
  {
    "id": "Buxa Tiger Reserve_Rajabhatkhawa",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Buxa Tiger Reserve",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rajabhatkhawa",
    "description": "One of Eastern India  s largest protected forest landscapes  known for biodiversity and trekking routes."
  },
  {
    "description": "Historic trekking route connecting Buxa Fort and Lepchakha village.",
    "destinationId": "Lepchakha",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Buxa-Lepchakha Trek Route",
    "gallery": [],
    "id": "Buxa-Lepchakha Trek Route_Lepchakha",
    "category": "Trek"
  },
  {
    "id": "Cactus Nursery_Kalimpong",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Cactus Nursery",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalimpong",
    "description": "A unique attraction showcasing rare cactus and succulent species from around the world."
  },
  {
    "destinationId": "Sabargram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Camping Area",
    "description": "Popular camping grounds used by trekkers exploring the Singalila region.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Camping Area_Sabargram"
  },
  {
    "description": "Open camping locations surrounded by forests and scenic viewpoints.",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Camping Areas",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Camping Areas_Kafer"
  },
  {
    "name": "Camping Grounds",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhalong",
    "description": "Riverside camping areas popular among nature lovers and adventure travelers.",
    "id": "Camping Grounds_Jhalong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Camping Meadows_Ahaldara",
    "gallery": [],
    "name": "Camping Meadows",
    "destinationId": "Ahaldara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Open grassy areas suitable for camping while enjoying mountain views and stargazing opportunities."
  },
  {
    "category": "Viewpoint",
    "id": "Canopy Walk_Lolegaon",
    "gallery": [],
    "description": "A famous hanging canopy bridge allowing visitors to walk above the forest canopy.",
    "name": "Canopy Walk",
    "destinationId": "Lolegaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Castleton Tea Estate is one of the most prestigious tea estates in Darjeeling  producing world-famous premium tea.",
    "name": "Castleton Tea Estate",
    "destinationId": "Castleton",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Castleton Tea Estate_Castleton",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Castleton Tea Estate is one of the most prestigious tea estates in the Darjeeling region  known for world-class tea and stunning mountain scenery.",
    "name": "Castleton Tea Estate",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "id": "Castleton Tea Estate_Kurseong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Chalsa Nature Park Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chalsa",
    "description": "Nature-based recreation area surrounded by forests and tea gardens.",
    "id": "Chalsa Nature Park Area_Chalsa",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Chalsa Viewpoints_Chalsa",
    "category": "Viewpoint",
    "description": "Scenic viewpoints overlooking forests  tea gardens  and Himalayan foothill landscapes.",
    "destinationId": "Chalsa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Chalsa Viewpoints"
  },
  {
    "description": "Elevated wildlife observation tower offering views of forests  grasslands  and elephant movement zones.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chapramari",
    "name": "Chandrachur Watch Tower",
    "gallery": [],
    "id": "Chandrachur Watch Tower_Chapramari",
    "category": "Viewpoint"
  },
  {
    "name": "Changey Falls",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kolakham",
    "description": "One of the most popular waterfalls in the Neora Valley region  surrounded by dense forests.",
    "id": "Changey Falls_Kolakham",
    "category": "Waterfall",
    "gallery": []
  },
  {
    "id": "Chapramari Watch Tower_Chapramari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "One of the most popular wildlife observation points inside the sanctuary.",
    "name": "Chapramari Watch Tower",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Chapramari Wildlife Sanctuary_Chapramari",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Chapramari Wildlife Sanctuary",
    "description": "A renowned wildlife sanctuary known for elephants  gaur  rich birdlife  and dense forest ecosystems along the Himalayan foothills."
  },
  {
    "gallery": [],
    "id": "Charkhole Viewpoint_Charkhole",
    "category": "Viewpoint",
    "description": "A scenic viewpoint known for panoramic Himalayan views and peaceful surroundings.",
    "destinationId": "Charkhole",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Charkhole Viewpoint"
  },
  {
    "description": "Dense forest corridor connecting Jaldapara National Park and Buxa Tiger Reserve.",
    "name": "Chilapata Forest",
    "destinationId": "Chilapata",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Chilapata Forest_Chilapata",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Chilapata Safari Gate_Chilapata",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chilapata",
    "name": "Chilapata Safari Gate",
    "description": "Entry point for jeep safaris into the forest region."
  },
  {
    "description": "The historic Chimney Heritage Site is associated with colonial-era settlement history and local heritage tourism.",
    "name": "Chimney Heritage Site",
    "destinationId": "Chimney",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Chimney Heritage Site_Chimney",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Chimney Village_Kurseong",
    "gallery": [],
    "name": "Chimney Village",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Chimney is a charming offbeat village known for its quiet atmosphere  forests  and panoramic Himalayan views."
  },
  {
    "description": "A peaceful Buddhist monastery known for prayer flags  mountain scenery  and spiritual significance.",
    "name": "Chitrey Monastery",
    "destinationId": "Chitrey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Chitrey Monastery_Chitrey",
    "category": "Monastery",
    "gallery": []
  },
  {
    "id": "Chowrasta Mall_Darjeeling",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Chowrasta Mall is the social heart of Darjeeling  featuring mountain views  local shops  cafes  and a vibrant hill-town atmosphere.",
    "name": "Chowrasta Mall",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling"
  },
  {
    "id": "Cinchona Heritage Trail_Munsong",
    "category": "Monastery",
    "gallery": [],
    "description": "A heritage route exploring the history of cinchona cultivation and quinine production in the region.",
    "name": "Cinchona Heritage Trail",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Munsong"
  },
  {
    "id": "Cinchona Museum Area_Mungpoo",
    "category": "Viewpoint",
    "gallery": [],
    "description": "An area highlighting the history of cinchona cultivation and quinine production in the region.",
    "name": "Cinchona Museum Area",
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Historic cinchona plantations established during the colonial era  surrounded by forests and mountain scenery.",
    "name": "Cinchona Plantation Area",
    "destinationId": "Latpanchar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Cinchona Plantation Area_Latpanchar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Cinchona Plantation_Mungpoo",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Historic cinchona plantations established for quinine production  surrounded by scenic mountain landscapes.",
    "name": "Cinchona Plantation",
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Cinchona Plantations_Munsong",
    "category": "Viewpoint",
    "description": "Historic cinchona plantations established during the British era for quinine production  surrounded by scenic mountain landscapes.",
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Cinchona Plantations"
  },
  {
    "description": "Winter offers some of the clearest Himalayan visibility and mountain photography opportunities.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "name": "Clear Mountain Views",
    "gallery": [],
    "id": "Clear Mountain Views_Lepchajagat",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Cloud Forest Experience_Lepchajagat",
    "category": "Viewpoint",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Cloud Forest Experience",
    "description": "Dense mist and cloud-covered forests create a unique monsoon atmosphere."
  },
  {
    "id": "Cloud Viewpoints_Meghma",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Cloud Viewpoints",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Meghma",
    "description": "Famous for dramatic cloud formations and panoramic Himalayan vistas."
  },
  {
    "category": "Viewpoint",
    "id": "Colonial Walking Route_Takdah",
    "gallery": [],
    "name": "Colonial Walking Route",
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A walking route connecting historic colonial-era landmarks and scenic viewpoints."
  },
  {
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Colonial-era Buildings",
    "description": "These historic structures reflect Kurseong  s colonial past and architectural heritage.",
    "gallery": [],
    "id": "Colonial-era Buildings_Kurseong",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Community Tourism Village_Dhupjhora",
    "category": "Village",
    "description": "Local tourism initiatives showcasing traditional lifestyles and culture.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dhupjhora",
    "name": "Community Tourism Village"
  },
  {
    "category": "Village",
    "id": "Community Tourism Villages_Dhupguri",
    "gallery": [],
    "name": "Community Tourism Villages",
    "destinationId": "Dhupguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Villages participating in community-based tourism initiatives."
  },
  {
    "gallery": [],
    "id": "Cooch Behar Palace Museum_Cooch Behar",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Cooch Behar",
    "name": "Cooch Behar Palace Museum",
    "description": "Museum inside the palace displaying royal artifacts and history."
  },
  {
    "gallery": [],
    "id": "Cooch Behar Palace_Cooch Behar",
    "category": "Monastery",
    "destinationId": "Cooch Behar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Cooch Behar Palace",
    "description": "Magnificent royal palace inspired by Buckingham Palace and the most iconic landmark of Cooch Behar."
  },
  {
    "id": "Coronation Bridge View Deck_Sevoke Corridor",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Coronation Bridge View Deck",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sevoke Corridor",
    "description": "Dedicated photography and observation points overlooking the bridge and river gorge."
  },
  {
    "destinationId": "Sevoke Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Coronation Bridge",
    "description": "The iconic bridge over the Teesta River  one of North Bengal  s most recognizable landmarks and photography locations.",
    "gallery": [],
    "id": "Coronation Bridge_Sevoke Corridor",
    "category": "Viewpoint"
  },
  {
    "description": "A hilltop landmark featuring a large cross and panoramic views of surrounding valleys and mountains.",
    "name": "Cross Hill",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pedong",
    "id": "Cross Hill_Pedong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Cultural Events_Dhupguri",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dhupguri",
    "name": "Cultural Events",
    "description": "Seasonal fairs and community celebrations."
  },
  {
    "gallery": [],
    "id": "Cultural Tourism Areas_Mainaguri",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mainaguri",
    "name": "Cultural Tourism Areas",
    "description": "Areas showcasing local traditions  fairs  and community culture."
  },
  {
    "category": "Monastery",
    "id": "Dali Monastery_Darjeeling",
    "gallery": [],
    "description": "Dali Monastery is one of the largest Tibetan Buddhist monasteries in the region  known for its architecture and spiritual significance.",
    "name": "Dali Monastery",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Damdim",
    "name": "Damdim Tea Factory",
    "description": "Tea processing facility where visitors can learn about tea manufacturing.",
    "gallery": [],
    "id": "Damdim Tea Factory_Damdim",
    "category": "Viewpoint"
  },
  {
    "description": "Extensive tea plantations forming part of the famous Dooars tea belt.",
    "destinationId": "Damdim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Damdim Tea Gardens",
    "gallery": [],
    "id": "Damdim Tea Gardens_Damdim",
    "category": "Viewpoint"
  },
  {
    "description": "Dense forests rich in biodiversity and nature trails.",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Damsang Forest",
    "gallery": [],
    "id": "Damsang Forest_Sillery Gaon",
    "category": "Viewpoint"
  },
  {
    "description": "Historic route leading toward the remains of the old Damsang Fort associated with Lepcha history.",
    "name": "Damsang Fort Route",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Damsang Fort Route_Sillery Gaon",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Damsang Fort Ruins_Pedong",
    "category": "Viewpoint",
    "description": "Historic ruins associated with the Lepcha kingdom and the region  s pre-colonial history.",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Damsang Fort Ruins"
  },
  {
    "destinationId": "Ghum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Darjeeling Himalayan Railway Ghoom Station",
    "description": "Ghoom Station is India s highest railway station and a major attraction on the UNESCO-listed Darjeeling Himalayan Railway route.",
    "gallery": [],
    "id": "Darjeeling Himalayan Railway Ghoom Station_Ghum",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Darjeeling Himalayan Railway Museum_Darjeeling",
    "gallery": [],
    "description": "A heritage museum preserving the history  engineering  and legacy of the toy train.",
    "name": "Darjeeling Himalayan Railway Museum",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "The toy train route passing through Kurseong offers one of the most scenic railway journeys in the Himalayas.",
    "name": "Darjeeling Himalayan Railway Route",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Darjeeling Himalayan Railway Route_Kurseong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Darjeeling Himalayan Railway Station_Darjeeling",
    "gallery": [],
    "description": "This historic railway station serves the UNESCO-listed Darjeeling Himalayan Railway  one of the world  s most celebrated mountain railways.",
    "name": "Darjeeling Himalayan Railway Station",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "The iconic Toy Train offers a unique journey through the hills  showcasing engineering heritage and spectacular scenery.",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Darjeeling Himalayan Railway",
    "gallery": [],
    "id": "Darjeeling Himalayan Railway_Darjeeling",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Dawaipani",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Dawaipani Viewpoint",
    "description": "A peaceful viewpoint offering panoramic views of Kanchenjunga  forests  and surrounding valleys.",
    "gallery": [],
    "id": "Dawaipani Viewpoint_Dawaipani",
    "category": "Viewpoint"
  },
  {
    "description": "This viewpoint offers scenic views of Kurseong  s forests and valleys while serving as a peaceful retreat for visitors.",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Deer Park Viewpoint",
    "gallery": [],
    "id": "Deer Park Viewpoint_Kurseong",
    "category": "Viewpoint"
  },
  {
    "description": "Deer Park is a popular recreation area surrounded by forests and walking trails  suitable for families and nature lovers.",
    "name": "Deer Park",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Deer Park_Kurseong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "A landscaped hilltop park offering panoramic views of the Himalayas  Teesta Valley  and surrounding hills.",
    "name": "Delo Park",
    "destinationId": "Delo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Delo Park_Delo",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Dense Forest Corridors",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "description": "Extensive forest corridors connecting wildlife habitats within the Mahananda ecosystem.",
    "id": "Dense Forest Corridors_Latpanchar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Deolo Hill_Kalimpong",
    "description": "The highest point in Kalimpong offering panoramic views of the Teesta Valley  surrounding hills  and Kanchenjunga on clear days.",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Deolo Hill"
  },
  {
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Devisthan Temple",
    "description": "Devisthan Temple is a revered religious site attracting pilgrims and visitors seeking spiritual experiences.",
    "gallery": [],
    "category": "Monastery",
    "id": "Devisthan Temple_Mirik"
  },
  {
    "name": "Dhupjhora Elephant Camp",
    "destinationId": "Dhupjhora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A well-known elephant camp associated with wildlife tourism and conservation activities.",
    "category": "Viewpoint",
    "id": "Dhupjhora Elephant Camp_Dhupjhora",
    "gallery": []
  },
  {
    "description": "Traditional regional market reflecting local commerce and culture.",
    "destinationId": "Dinhata",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Dinhata Town Market",
    "gallery": [],
    "id": "Dinhata Town Market_Dinhata",
    "category": "Viewpoint"
  },
  {
    "description": "Scenic viewpoints overlooking tea estates and foothill landscapes.",
    "name": "Dooars Tea Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Malbazar",
    "id": "Dooars Tea Photography Points_Malbazar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Dow Hill Forest_Kurseong",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Dow Hill Forest",
    "description": "Dow Hill Forest is a dense Himalayan forest popular for nature walks  photography  birdwatching  and its atmospheric woodland environment."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Dow Hill Viewpoints",
    "description": "The Dow Hill viewpoints provide beautiful views of forests  rolling hills  and the surrounding mountain landscape.",
    "gallery": [],
    "id": "Dow Hill Viewpoints_Kurseong",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Dr. Graham  s Homes_Kalimpong",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Dr. Graham  s Homes",
    "description": "A historic educational institution known for its colonial architecture and cultural significance."
  },
  {
    "description": "The main hilltop viewpoint offering spectacular 360-degree views of Kalimpong and the surrounding valleys.",
    "destinationId": "Durpin",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Durpin Dara Viewpoint",
    "gallery": [],
    "id": "Durpin Dara Viewpoint_Durpin",
    "category": "Viewpoint"
  },
  {
    "name": "Durpin Dara",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A famous hilltop viewpoint providing spectacular views of Kalimpong town  the Teesta River  and Himalayan ranges.",
    "id": "Durpin Dara_Kalimpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Durpin Monastery",
    "destinationId": "Durpin",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Also known as Zang Dhok Palri Phodang Monastery  this is one of Kalimpong  s most important Buddhist monasteries.",
    "id": "Durpin Monastery_Durpin",
    "category": "Monastery",
    "gallery": []
  },
  {
    "name": "Eagle  s Crag",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "description": "Eagle  s Crag is Kurseong  s most famous viewpoint  offering panoramic views of the Himalayan ranges  tea gardens  and surrounding valleys.",
    "id": "Eagle  s Crag_Kurseong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Walking trails through gardens  forests  and scenic viewpoints around Delo.",
    "name": "Eco Park Walking Trails",
    "destinationId": "Delo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Eco Park Walking Trails_Delo",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Eco Tourism Centres_Dhupjhora",
    "category": "Viewpoint",
    "description": "Community-driven tourism facilities promoting sustainable tourism.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dhupjhora",
    "name": "Eco Tourism Centres"
  },
  {
    "destinationId": "Lataguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Eco Tourism Complex",
    "description": "A tourism facility supporting wildlife tourism  accommodation  and visitor services.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Eco Tourism Complex_Lataguri"
  },
  {
    "gallery": [],
    "id": "Eco Tourism Corridor_Gitdubling",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gitdubling",
    "name": "Eco Tourism Corridor",
    "description": "Nature-based tourism zone connecting rivers  forests  and village attractions."
  },
  {
    "id": "Eco Tourism Zone_Kolakham",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A nature-focused tourism area promoting sustainable travel  wildlife awareness  and forest experiences.",
    "name": "Eco Tourism Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kolakham"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Paren",
    "name": "Eco Tourism Zone",
    "description": "A conservation-focused tourism area promoting nature and wildlife experiences.",
    "gallery": [],
    "id": "Eco Tourism Zone_Paren",
    "category": "Viewpoint"
  },
  {
    "id": "Eco-Tourism Corridor_Jogighat",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A nature-focused tourism zone connecting riverside areas  forests  and local villages.",
    "name": "Eco-Tourism Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jogighat"
  },
  {
    "description": "Conservation-focused tourism experiences highlighting the region  s biodiversity and wetland ecology.",
    "name": "Eco-Tourism Zone",
    "destinationId": "Namthing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Eco-Tourism Zone_Namthing",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Elephant Corridors_Chapramari",
    "category": "Viewpoint",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Elephant Corridors",
    "description": "Important elephant movement corridors connecting forests across the Dooars landscape."
  },
  {
    "category": "Viewpoint",
    "id": "Elephant Interaction Zone_Dhupjhora",
    "gallery": [],
    "description": "Educational experiences focused on elephant conservation and management.",
    "name": "Elephant Interaction Zone",
    "destinationId": "Dhupjhora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Elephant Movement Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Khunia",
    "description": "Important elephant movement routes within the forest ecosystem.",
    "id": "Elephant Movement Corridor_Khunia",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Elephant Movement Corridor_Mongpong",
    "destinationId": "Mongpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Elephant Movement Corridor",
    "description": "A recognized elephant movement zone connecting forest ecosystems across the Teesta landscape."
  },
  {
    "destinationId": "Gopaldhara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Estate Photography Points",
    "description": "Popular photography locations showcasing tea gardens  workers  and mountain backdrops.",
    "gallery": [],
    "id": "Estate Photography Points_Gopaldhara",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Estate Viewpoints_Margaret  s Hope",
    "gallery": [],
    "name": "Estate Viewpoints",
    "destinationId": "Margaret  s Hope",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Elevated locations offering panoramic views of tea gardens and surrounding hills."
  },
  {
    "name": "Everest Museum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "description": "This museum presents exhibits related to Himalayan mountaineering and the legacy of Everest expeditions.",
    "id": "Everest Museum_Darjeeling",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "On clear days  visitors can see Mount Everest  Makalu  and Lhotse from here.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sandakphu",
    "name": "Everest View Point",
    "gallery": [],
    "id": "Everest View Point_Sandakphu",
    "category": "Viewpoint"
  },
  {
    "description": "Unique Himalayan viewpoint providing simultaneous views of Everest and Kanchenjunga ranges.",
    "destinationId": "Phalut",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Everest-Kanchenjunga Corridor",
    "gallery": [],
    "id": "Everest-Kanchenjunga Corridor_Phalut",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Fikkalaygaon Forest Belt_Fikkalaygaon",
    "gallery": [],
    "description": "Forest area surrounding the village offering scenic nature experiences.",
    "name": "Fikkalaygaon Forest Belt",
    "destinationId": "Fikkalaygaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Fikkalaygaon Sunrise Viewpoint_Fikkalaygaon",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Fikkalaygaon Sunrise Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Fikkalaygaon",
    "description": "Popular sunrise location overlooking mountain ridges and valleys."
  },
  {
    "destinationId": "Fikkalaygaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Fikkalaygaon Village",
    "description": "Scenic Himalayan village known for community-based tourism and peaceful surroundings.",
    "gallery": [],
    "category": "Village",
    "id": "Fikkalaygaon Village_Fikkalaygaon"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Flower Nurseries_Kalimpong",
    "description": "Kalimpong  s famous flower nurseries are known for orchids  gladioli  and ornamental plants.",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Flower Nurseries"
  },
  {
    "gallery": [],
    "id": "Flycatcher Viewing Areas_Lepchajagat",
    "category": "Viewpoint",
    "description": "Popular birding locations supporting multiple flycatcher species.",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Flycatcher Viewing Areas"
  },
  {
    "id": "Folk Art Interpretation Centre_Kushmandi",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Visitor area showcasing local folk art  masks  and cultural heritage.",
    "name": "Folk Art Interpretation Centre",
    "destinationId": "Kushmandi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Entry points to nearby forests that provide opportunities for nature walks  birdwatching  and eco-tourism.",
    "destinationId": "Jogighat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Access Points",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Access Points_Jogighat"
  },
  {
    "description": "Birdwatching zone supporting a variety of Himalayan forest bird species throughout the year.",
    "name": "Forest Birding Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Srikhola",
    "id": "Forest Birding Area_Srikhola",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Forest Birding Areas_Icchey Gaon",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Forest habitats supporting a variety of Himalayan bird species.",
    "name": "Forest Birding Areas",
    "destinationId": "Icchey Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Birding Areas_Kafer",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Birding Areas",
    "description": "Forest habitats supporting numerous Himalayan bird species."
  },
  {
    "destinationId": "Khunia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Birding Areas",
    "description": "Rich bird habitats attracting resident and migratory bird species.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Birding Areas_Khunia"
  },
  {
    "description": "Rich bird habitats attracting birdwatchers throughout the season.",
    "destinationId": "Murti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Birding Areas",
    "gallery": [],
    "id": "Forest Birding Areas_Murti",
    "category": "Viewpoint"
  },
  {
    "id": "Forest Birding Areas_Reshikhola",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Forest habitats supporting numerous Himalayan bird species.",
    "name": "Forest Birding Areas",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Forest Birding Areas",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest habitats around Sittong support diverse Himalayan bird species and birdwatching opportunities.",
    "id": "Forest Birding Areas_Sittong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Forest Birding Trail",
    "destinationId": "Gorkhey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Nature trail passing through bird-rich forest habitats popular among birdwatchers and photographers.",
    "category": "Viewpoint",
    "id": "Forest Birding Trail_Gorkhey",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Namthing",
    "name": "Forest Birding Trail",
    "description": "Forest routes supporting birdwatching and wildlife observation activities.",
    "gallery": [],
    "id": "Forest Birding Trail_Namthing",
    "category": "Viewpoint"
  },
  {
    "description": "Forest habitats supporting a variety of Himalayan bird species.",
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Birding Zones",
    "gallery": [],
    "id": "Forest Birding Zones_Chuikhim",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Forest Birding Zones_Pabong",
    "category": "Viewpoint",
    "destinationId": "Pabong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Birding Zones",
    "description": "Forest habitats supporting numerous Himalayan bird species."
  },
  {
    "destinationId": "Rohini",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Birding Zones",
    "description": "Forest habitats around Rohini support diverse Himalayan birdlife and attract birdwatchers throughout the year.",
    "gallery": [],
    "id": "Forest Birding Zones_Rohini",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Forest Birding Zones_Sillery Gaon",
    "category": "Viewpoint",
    "description": "Bird-rich forest habitats attracting birdwatchers and wildlife enthusiasts.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sillery Gaon",
    "name": "Forest Birding Zones"
  },
  {
    "description": "Forest habitat supporting elephants  rhinoceros  gaur  and deer.",
    "destinationId": "Khunia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Corridor",
    "gallery": [],
    "id": "Forest Corridor_Khunia",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Forest Corridors_Bindu",
    "category": "Viewpoint",
    "destinationId": "Bindu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Corridors",
    "description": "Biodiversity-rich forests surrounding the river valley and border region."
  },
  {
    "description": "Forest stretches connecting important wildlife habitats in the Dooars.",
    "name": "Forest Corridors",
    "destinationId": "Mateli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Forest Corridors_Mateli",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Forest Corridors_Nagrakata",
    "gallery": [],
    "name": "Forest Corridors",
    "destinationId": "Nagrakata",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest belts connecting wildlife habitats of Gorumara  Chapramari  and surrounding reserves."
  },
  {
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Corridors",
    "description": "Dense forest corridors rich in biodiversity and wildlife habitats.",
    "gallery": [],
    "id": "Forest Corridors_Todey",
    "category": "Viewpoint"
  },
  {
    "id": "Forest Eco Trails_Todey",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Forest Eco Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Todey",
    "description": "Nature trails through forests highlighting biodiversity and conservation values."
  },
  {
    "id": "Forest Eco-Trails_Latpanchar",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Forest Eco-Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "description": "Guided eco-trails focusing on biodiversity  conservation  and nature interpretation."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Entry Area_Batabari",
    "description": "One of the entry zones providing access to wildlife safari routes in Gorumara.",
    "destinationId": "Batabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Entry Area"
  },
  {
    "id": "Forest Museum_Kurseong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "The Forest Museum highlights the ecology  wildlife  and forest heritage of the Darjeeling hills region.",
    "name": "Forest Museum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong"
  },
  {
    "description": "Museum presenting the natural history and forest heritage of the region.",
    "name": "Forest Museum",
    "destinationId": "Rajabhatkhawa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Forest Museum_Rajabhatkhawa",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Forest Nature Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bindu",
    "description": "Trails passing through forests rich in birdlife and Himalayan vegetation.",
    "id": "Forest Nature Trails_Bindu",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Forest Nature Trails_Lolegaon",
    "gallery": [],
    "description": "Walking routes through old-growth forests and biodiversity-rich landscapes.",
    "name": "Forest Nature Trails",
    "destinationId": "Lolegaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Forest Nature Trails_Tingling",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tingling",
    "name": "Forest Nature Trails",
    "description": "Forest trails around Tingling offer peaceful walks  birdwatching  and natural scenery."
  },
  {
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Nature Walks",
    "description": "Walking routes through forests and plantation areas showcasing local biodiversity.",
    "gallery": [],
    "id": "Forest Nature Walks_Munsong",
    "category": "Viewpoint"
  },
  {
    "id": "Forest Observation Deck_Lepchajagat",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A scenic observation point overlooking pine forests  valleys  and distant mountain ranges.",
    "name": "Forest Observation Deck",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat"
  },
  {
    "gallery": [],
    "id": "Forest Photography Corridor_Lingsey",
    "category": "Viewpoint",
    "destinationId": "Lingsey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Photography Corridor",
    "description": "Scenic forest locations popular among landscape and wildlife photographers."
  },
  {
    "id": "Forest Photography Corridor_Peshok",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Forest Photography Corridor",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A scenic route through forests and mountain roads popular among photographers."
  },
  {
    "description": "Scenic locations ideal for landscape and forest photography.",
    "destinationId": "Algarah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Photography Points",
    "gallery": [],
    "id": "Forest Photography Points_Algarah",
    "category": "Viewpoint"
  },
  {
    "name": "Forest Photography Points",
    "destinationId": "Batabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic wildlife photography locations inside forest corridors.",
    "id": "Forest Photography Points_Batabari",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Forest Photography Points_Gitdubling",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gitdubling",
    "name": "Forest Photography Points",
    "description": "Scenic spots suitable for landscape and nature photography."
  },
  {
    "description": "Scenic forest locations popular among nature photographers.",
    "name": "Forest Photography Points",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Forest Photography Points_Paren",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Forest Photography Points",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Locations suitable for capturing forests  valleys  and rural scenery.",
    "category": "Viewpoint",
    "id": "Forest Photography Points_Tangta",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Forest Photography Zones_Ramdhura",
    "category": "Viewpoint",
    "destinationId": "Ramdhura",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Photography Zones",
    "description": "Popular spots for landscape  forest  and sunrise photography."
  },
  {
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Picnic Areas",
    "description": "Designated picnic spots within forested areas where visitors can enjoy the natural beauty of Mirik.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Picnic Areas_Mirik"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sittong",
    "name": "Forest Picnic Spots",
    "description": "Quiet picnic locations surrounded by forests and mountain scenery.",
    "gallery": [],
    "id": "Forest Picnic Spots_Sittong",
    "category": "Viewpoint"
  },
  {
    "description": "Historic forest rest house surroundings known for birding  nature tourism  and peaceful forest landscapes.",
    "name": "Forest Rest House Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mongpong",
    "id": "Forest Rest House Area_Mongpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Forest Ridge Walk_Durpin",
    "category": "Viewpoint",
    "destinationId": "Durpin",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Ridge Walk",
    "description": "A scenic walking route through forested slopes and viewpoints around Durpin Hill."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Ridge Walks_Ahaldara",
    "description": "Scenic ridge-top walking trails passing through forests and viewpoints around Ahaldara.",
    "destinationId": "Ahaldara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Ridge Walks"
  },
  {
    "destinationId": "Charkhole",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Ridge Walks",
    "description": "Forest trails connecting viewpoints and village areas around Charkhole.",
    "gallery": [],
    "id": "Forest Ridge Walks_Charkhole",
    "category": "Viewpoint"
  },
  {
    "description": "Scenic ridge trails through forests and mountain landscapes around Dawaipani.",
    "name": "Forest Ridge Walks",
    "destinationId": "Dawaipani",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Forest Ridge Walks_Dawaipani",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Forest Ridge Walks_Rikisum",
    "gallery": [],
    "description": "Ridge-top trails through forests connecting scenic viewpoints and natural landscapes.",
    "name": "Forest Ridge Walks",
    "destinationId": "Rikisum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Forest Riverside Trails_Jhalong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Walking trails along rivers and forests showcasing the biodiversity of the region.",
    "name": "Forest Riverside Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhalong"
  },
  {
    "destinationId": "Chalsa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Roads",
    "description": "Beautiful forest roads passing through wildlife habitats and tea estates.",
    "gallery": [],
    "id": "Forest Roads_Chalsa",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Roads",
    "description": "Quiet forest roads passing through plantations  forests  and hillside settlements.",
    "gallery": [],
    "id": "Forest Roads_Mungpoo",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Forest Roads_Munsong",
    "gallery": [],
    "description": "Quiet mountain roads passing through forests  plantations  and hill settlements.",
    "name": "Forest Roads",
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Forest Roads",
    "destinationId": "Sevoke Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Beautiful forest roads passing through the Mahananda Wildlife Sanctuary landscape.",
    "id": "Forest Roads_Sevoke Corridor",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Forest Roads_Takdah",
    "category": "Viewpoint",
    "description": "Quiet forest roads offering beautiful drives through pine forests and tea gardens.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Takdah",
    "name": "Forest Roads"
  },
  {
    "destinationId": "Gitdubling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Routes",
    "description": "Nature routes passing through biodiversity-rich forests and mountain terrain.",
    "gallery": [],
    "id": "Forest Routes_Gitdubling",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Trails_Algarah",
    "destinationId": "Algarah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails",
    "description": "Nature trails passing through pine forests and biodiversity-rich mountain landscapes."
  },
  {
    "gallery": [],
    "id": "Forest Trails_Chitrey",
    "category": "Viewpoint",
    "description": "Scenic trails through forests connecting Chitrey with higher trekking destinations.",
    "destinationId": "Chitrey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails"
  },
  {
    "gallery": [],
    "id": "Forest Trails_Latpanchar",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "name": "Forest Trails",
    "description": "Scenic forest trails passing through dense woodland  wildlife habitats  and mountain landscapes."
  },
  {
    "gallery": [],
    "id": "Forest Trails_Lava",
    "category": "Viewpoint",
    "description": "Scenic trails through dense temperate forests rich in flora  fauna  and birdlife.",
    "destinationId": "Lava",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails"
  },
  {
    "description": "Nature trails passing through forests  mountain ridges  and village landscapes.",
    "destinationId": "Lingsey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails",
    "gallery": [],
    "id": "Forest Trails_Lingsey",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Forest Trails_Murti",
    "category": "Viewpoint",
    "description": "Walking trails through riverine forests rich in biodiversity and wildlife.",
    "destinationId": "Murti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails"
  },
  {
    "gallery": [],
    "id": "Forest Trails_Namthing",
    "category": "Viewpoint",
    "destinationId": "Namthing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails",
    "description": "Walking trails passing through forests surrounding the wetland ecosystem."
  },
  {
    "category": "Viewpoint",
    "id": "Forest Trails_Pabong",
    "gallery": [],
    "name": "Forest Trails",
    "destinationId": "Pabong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Nature trails through forests rich in biodiversity and mountain scenery."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Paren",
    "name": "Forest Trails",
    "description": "Scenic trails through forests  valleys  and biodiversity-rich mountain landscapes.",
    "gallery": [],
    "id": "Forest Trails_Paren",
    "category": "Viewpoint"
  },
  {
    "name": "Forest Trails",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic trails passing through forests rich in biodiversity and mountain landscapes.",
    "id": "Forest Trails_Pedong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Forest Trails_Ramdhura",
    "gallery": [],
    "name": "Forest Trails",
    "destinationId": "Ramdhura",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Nature trails through pine forests and biodiversity-rich mountain environments."
  },
  {
    "name": "Forest Trails",
    "destinationId": "Rammam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest routes connecting Rammam with nearby trekking destinations and villages.",
    "category": "Viewpoint",
    "id": "Forest Trails_Rammam",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Forest Trails_Rishop",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails",
    "description": "Walking trails through pine forests and mountain landscapes around Rishop."
  },
  {
    "gallery": [],
    "id": "Forest Trails_Sabargram",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sabargram",
    "name": "Forest Trails",
    "description": "Scenic forest trails passing through wilderness areas rich in Himalayan flora and fauna."
  },
  {
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Trails",
    "description": "Walking routes through forests and mountain environments rich in biodiversity.",
    "gallery": [],
    "id": "Forest Trails_Tangta",
    "category": "Viewpoint"
  },
  {
    "name": "Forest View Deck",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chalsa",
    "description": "Elevated location offering panoramic views of forests and surrounding foothills.",
    "id": "Forest View Deck_Chalsa",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lataguri",
    "name": "Forest View Towers",
    "description": "Elevated watchtowers offering opportunities to observe wildlife near grasslands and water bodies.",
    "gallery": [],
    "id": "Forest View Towers_Lataguri",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Icchey Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Viewpoints",
    "description": "Scenic viewpoints overlooking forests  valleys  and distant Himalayan ridges.",
    "gallery": [],
    "id": "Forest Viewpoints_Icchey Gaon",
    "category": "Viewpoint"
  },
  {
    "id": "Forest Viewpoints_Kaiyakatta",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Forest Viewpoints",
    "destinationId": "Kaiyakatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic viewpoints overlooking forests and mountain ridges."
  },
  {
    "id": "Forest Viewpoints_Kolakham",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Elevated locations offering panoramic views of forests  valleys  and Himalayan ridges.",
    "name": "Forest Viewpoints",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kolakham"
  },
  {
    "category": "Village",
    "id": "Forest Villages_Dhupjhora",
    "gallery": [],
    "name": "Forest Villages",
    "destinationId": "Dhupjhora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest-fringe villages offering eco-tourism and local cultural experiences."
  },
  {
    "gallery": [],
    "id": "Forest Walking Trails_Kurseong",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Forest Walking Trails",
    "description": "These scenic walking trails allow visitors to explore pine forests  natural landscapes  and local biodiversity."
  },
  {
    "destinationId": "Chimney",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Walks",
    "description": "Forest walking trails around Chimney offer tranquil surroundings and opportunities for nature exploration.",
    "gallery": [],
    "id": "Forest Walks_Chimney",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Forest Walks_Chuikhim",
    "category": "Viewpoint",
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Walks",
    "description": "Peaceful walking trails through forests rich in biodiversity and natural beauty."
  },
  {
    "description": "Scenic walking routes through dense forests and natural landscapes.",
    "destinationId": "Gorkhey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Walks",
    "gallery": [],
    "id": "Forest Walks_Gorkhey",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Forest Walks_Kafer",
    "category": "Viewpoint",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Walks",
    "description": "Walking trails through forests and mountain landscapes around Kafer."
  },
  {
    "description": "Nature trails through riverside forests rich in biodiversity and scenic beauty.",
    "name": "Forest Walks",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Forest Walks_Reshikhola",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Forest Walks_Tinchuley",
    "category": "Viewpoint",
    "description": "Nature trails passing through forests and rural landscapes.",
    "destinationId": "Tinchuley",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Forest Walks"
  },
  {
    "id": "Forest Watch Point_Dhupjhora",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Forest Watch Point",
    "destinationId": "Dhupjhora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Observation locations for wildlife and forest landscapes."
  },
  {
    "gallery": [],
    "id": "Four Highest Peaks View Corridor_Sandakphu",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sandakphu",
    "name": "Four Highest Peaks View Corridor",
    "description": "Spectacular mountain corridor offering views of Everest  Kanchenjunga  Lhotse and Makalu on clear days."
  },
  {
    "id": "Freedom Fighter Memorial Site_Buxa Fort",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Freedom Fighter Memorial Site",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Buxa Fort",
    "description": "Associated with India  s independence movement and political prisoners."
  },
  {
    "gallery": [],
    "id": "Ganga Maya Park_Darjeeling",
    "category": "Viewpoint",
    "description": "Ganga Maya Park is a popular recreational area known for streams  gardens  and cultural performances.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "name": "Ganga Maya Park"
  },
  {
    "gallery": [],
    "id": "Gangarampur Town Market_Gangarampur",
    "category": "Viewpoint",
    "destinationId": "Gangarampur",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Gangarampur Town Market",
    "description": "Traditional regional market representing local commerce and culture."
  },
  {
    "gallery": [],
    "id": "Gateway to East Sikkim_Rongli",
    "category": "Viewpoint",
    "description": "Rongli serves as an important gateway to East Sikkim and nearby Himalayan destinations.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rongli",
    "name": "Gateway to East Sikkim"
  },
  {
    "gallery": [],
    "id": "Gayabari Orange Belt_Gayabari",
    "category": "Viewpoint",
    "description": "The Gayabari orange-growing region is known for hillside orchards  scenic views  and traditional farming practices.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gayabari",
    "name": "Gayabari Orange Belt"
  },
  {
    "description": "Tea estate located along the historic Darjeeling Himalayan Railway route.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ghayabari",
    "name": "Ghayabari Tea Estate",
    "gallery": [],
    "id": "Ghayabari Tea Estate_Ghayabari",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Ghayabari Toy Train Viewpoint_Ghayabari",
    "category": "Viewpoint",
    "description": "Popular location for viewing and photographing the Darjeeling Himalayan Railway.",
    "destinationId": "Ghayabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ghayabari Toy Train Viewpoint"
  },
  {
    "id": "Ghoom Monastery_Ghum",
    "category": "Monastery",
    "gallery": [],
    "name": "Ghoom Monastery",
    "destinationId": "Ghum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Ghoom Monastery  also known as Yiga Choeling Monastery  is one of the oldest Tibetan Buddhist monasteries in the Darjeeling Hills and houses a magnificent Maitreya Buddha statue."
  },
  {
    "description": "India  s highest railway station and one of the most important landmarks on the Darjeeling Himalayan Railway.",
    "destinationId": "Ghum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ghoom Railway Station",
    "gallery": [],
    "id": "Ghoom Railway Station_Ghum",
    "category": "Viewpoint"
  },
  {
    "description": "A scenic viewpoint offering panoramic views of Darjeeling town  surrounding valleys  and Himalayan peaks.",
    "name": "Ghoom Viewpoint",
    "destinationId": "Ghum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Ghoom Viewpoint_Ghum",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Giddapahar Monastery_Kurseong",
    "category": "Monastery",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Giddapahar Monastery",
    "description": "Giddapahar Monastery is a peaceful Buddhist monastery known for spiritual significance and scenic surroundings."
  },
  {
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ging Tea Estate Access",
    "description": "Access point to one of Darjeeling  s renowned tea estates known for tea production and heritage value.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Ging Tea Estate Access_Takdah"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gopaldhara",
    "name": "Gopaldhara Tea Estate",
    "description": "Gopaldhara Tea Estate is famous for premium Darjeeling tea  scenic landscapes  and traditional plantation culture.",
    "gallery": [],
    "id": "Gopaldhara Tea Estate_Gopaldhara",
    "category": "Viewpoint"
  },
  {
    "id": "Gorkha War Memorial_Darjeeling",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Gorkha War Memorial",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "description": "The memorial honors the bravery and sacrifices of Gorkha soldiers and serves as an important cultural landmark."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gorkhey",
    "name": "Gorkhey Village",
    "description": "A picturesque Himalayan village surrounded by forests and mountains  known for its traditional charm.",
    "gallery": [],
    "id": "Gorkhey Village_Gorkhey",
    "category": "Village"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lataguri",
    "name": "Gorumara National Park",
    "description": "One of North Bengal  s premier wildlife destinations  famous for Indian one-horned rhinoceros  elephants  bison  and rich biodiversity.",
    "gallery": [],
    "id": "Gorumara National Park_Lataguri",
    "category": "Viewpoint"
  },
  {
    "description": "Ancient archaeological site linked to the Kamatapur Kingdom.",
    "name": "Gosanimari Rajpat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Cooch Behar",
    "id": "Gosanimari Rajpat_Cooch Behar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Gouripur House",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A historic residence associated with Rabindranath Tagore  s visits to Kalimpong.",
    "id": "Gouripur House_Kalimpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Grassland habitats frequently visited by herbivores and birds.",
    "name": "Grassland Observation Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Batabari",
    "id": "Grassland Observation Zone_Batabari",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Gumbadara View Point_Tinchuley",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tinchuley",
    "name": "Gumbadara View Point",
    "description": "A scenic viewpoint known for mountain panoramas and beautiful sunrise photography."
  },
  {
    "category": "Viewpoint",
    "id": "Hairpin Bend Viewpoints_Peshok",
    "gallery": [],
    "description": "Famous viewpoints overlooking the iconic hairpin bends of the Peshok Road and the Teesta Valley.",
    "name": "Hairpin Bend Viewpoints",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "category": "Viewpoint",
    "id": "Hanuman Top_Kalimpong",
    "gallery": [],
    "name": "Hanuman Top",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A hilltop viewpoint featuring a Hanuman temple and panoramic views of the surrounding mountains."
  },
  {
    "description": "Known locally due to the strategic airbase presence (only public viewing areas  not the base itself).",
    "name": "Hasimara Air Force Station View Area*",
    "destinationId": "Hasimara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Hasimara Air Force Station View Area*_Hasimara",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Hauri River_Totopara",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Totopara",
    "name": "Hauri River",
    "description": "Scenic river flowing through the Totopara landscape and surrounding forests."
  },
  {
    "gallery": [],
    "id": "Heritage Bungalows_Bagora",
    "category": "Viewpoint",
    "description": "Historic bungalows reflect the colonial legacy of the Darjeeling hills and provide scenic viewpoints.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bagora",
    "name": "Heritage Bungalows"
  },
  {
    "gallery": [],
    "id": "Heritage Bungalows_Makaibari",
    "category": "Monastery",
    "destinationId": "Makaibari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Bungalows",
    "description": "Historic tea bungalows showcase colonial-era architecture and the rich legacy of Darjeeling  s tea industry."
  },
  {
    "description": "A historic church reflecting the colonial and missionary history of the Kalimpong region.",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Church",
    "gallery": [],
    "id": "Heritage Church_Pedong",
    "category": "Monastery"
  },
  {
    "name": "Heritage Church",
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A historic church known for colonial architecture and peaceful surroundings.",
    "category": "Monastery",
    "id": "Heritage Church_Takdah",
    "gallery": []
  },
  {
    "name": "Heritage Forest Route",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "description": "A scenic forest corridor showcasing the natural and ecological heritage of the region.",
    "id": "Heritage Forest Route_Lepchajagat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Heritage Forest_Lolegaon",
    "category": "Viewpoint",
    "description": "Ancient forest areas featuring rich biodiversity and tranquil natural surroundings.",
    "destinationId": "Lolegaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Forest"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Heritage Hospital Area_Munsong",
    "description": "The historic cinchona hospital complex reflecting the region  s colonial medical heritage.",
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Hospital Area"
  },
  {
    "id": "Heritage Railway Stations_Kurseong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Historic stations on the Darjeeling Himalayan Railway route showcase colonial engineering and mountain railway heritage.",
    "name": "Heritage Railway Stations",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Heritage Tea Bungalows_Thurbo",
    "destinationId": "Thurbo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Tea Bungalows",
    "description": "Colonial-era tea bungalows showcase the heritage and history of Darjeeling  s tea industry."
  },
  {
    "description": "Visitors can explore the history and cultural significance of tea cultivation in the Darjeeling hills.",
    "destinationId": "Ambotia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Tea Tourism",
    "gallery": [],
    "id": "Heritage Tea Tourism_Ambotia",
    "category": "Monastery"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Heritage Toy Train Ride_Kurseong",
    "description": "The Darjeeling Himalayan Railway toy train ride is one of the world  s most iconic mountain railway experiences.",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Toy Train Ride"
  },
  {
    "name": "Heritage Village Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lolegaon",
    "description": "Traditional village surroundings showcasing local culture and mountain lifestyles.",
    "id": "Heritage Village Area_Lolegaon",
    "category": "Village",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Heritage Walking Route_Algarah",
    "category": "Monastery",
    "destinationId": "Algarah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Heritage Walking Route",
    "description": "A walking route exploring the historical and cultural landmarks of Algarah."
  },
  {
    "name": "High Altitude Flora Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Phalut",
    "description": "Alpine vegetation zone known for rhododendron forests and rare mountain flora.",
    "id": "High Altitude Flora Zone_Phalut",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Biodiversity-rich alpine zone featuring rhododendrons  magnolias and rare Himalayan plant species.",
    "name": "High Altitude Flora Zone",
    "destinationId": "Sandakphu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "High Altitude Flora Zone_Sandakphu",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "High Altitude Grasslands_Sabargram",
    "description": "Expansive alpine grasslands offering open mountain landscapes and seasonal wildflower blooms.",
    "destinationId": "Sabargram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "High Altitude Grasslands"
  },
  {
    "description": "Elevated viewpoints offering dramatic mountain panoramas.",
    "name": "High Altitude Views",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bikeybhanjang",
    "id": "High Altitude Views_Bikeybhanjang",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Local market area reflecting the unique culture and trade history of the border region.",
    "name": "Hili Border Market",
    "destinationId": "Hili",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Hili Border Market_Hili",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "One of the most accessible India?Bangladesh border locations with visible cross-border infrastructure and activity.",
    "destinationId": "Hili",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Hili International Border",
    "gallery": [],
    "id": "Hili International Border_Hili",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Hili Railway Heritage Zone_Hili",
    "category": "Monastery",
    "destinationId": "Hili",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Hili Railway Heritage Zone",
    "description": "Historic railway infrastructure associated with the pre-partition railway network."
  },
  {
    "description": "Historic mountain road section offering panoramic valley views.",
    "destinationId": "Ghayabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Hill Cart Road Scenic Section",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Hill Cart Road Scenic Section_Ghayabari"
  },
  {
    "description": "This section of the historic Hill Cart Road offers beautiful mountain landscapes  forests  and railway crossings.",
    "name": "Hill Cart Road Scenic Stretch",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ghum",
    "id": "Hill Cart Road Scenic Stretch_Ghum",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Himalayan Bulbul Observation Area_Lepchajagat",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Areas where Himalayan Bulbuls are frequently observed in forest and woodland habitats.",
    "name": "Himalayan Bulbul Observation Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat"
  },
  {
    "description": "Elevated viewpoints overlooking the transition from hills to plains.",
    "name": "Himalayan Foothill Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mongpong",
    "id": "Himalayan Foothill Viewpoint_Mongpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Himalayan Mountaineering Institute_Darjeeling",
    "gallery": [],
    "name": "Himalayan Mountaineering Institute",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "One of India  s most prestigious mountaineering institutions  showcasing Himalayan exploration and climbing history."
  },
  {
    "id": "Himalayan Panorama Deck_Durpin",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A viewing area showcasing mountain ranges  valleys  and forested landscapes.",
    "name": "Himalayan Panorama Deck",
    "destinationId": "Durpin",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Himalayan Panorama Deck_Kafer",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A panoramic viewing platform overlooking valleys and mountain ranges.",
    "name": "Himalayan Panorama Deck",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Himalayan Panorama Point_Ahaldara",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A panoramic viewing area offering wide-angle views of Kanchenjunga  surrounding ridges  and distant valleys.",
    "name": "Himalayan Panorama Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ahaldara"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rishop",
    "name": "Himalayan Panorama Point",
    "description": "A panoramic viewpoint offering wide-angle views of multiple Himalayan ranges.",
    "gallery": [],
    "id": "Himalayan Panorama Point_Rishop",
    "category": "Viewpoint"
  },
  {
    "description": "Popular photography locations for landscapes  forests  and birdlife.",
    "name": "Himalayan Photography Points",
    "destinationId": "Lava",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Himalayan Photography Points_Lava",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "A scenic ridge area offering wide-angle views of forests  tea gardens  and mountain ranges.",
    "name": "Himalayan Ridge View Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ghum",
    "id": "Himalayan Ridge View Area_Ghum",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Himalayan Salamander Habitat",
    "description": "Moist forest habitats supporting populations of the rare Himalayan Salamander.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Himalayan Salamander Habitat_Lepchajagat"
  },
  {
    "description": "One of the most important habitats of the rare Himalayan Salamander in North Bengal.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Namthing",
    "name": "Himalayan Salamander Habitat",
    "gallery": [],
    "id": "Himalayan Salamander Habitat_Namthing",
    "category": "Viewpoint"
  },
  {
    "description": "Forest ecosystems inhabited by Himalayan squirrel species.",
    "name": "Himalayan Squirrel Zones",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Himalayan Squirrel Zones_Lepchajagat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Himalayan Tibet Museum",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A cultural museum highlighting Tibetan history  heritage  and the region  s Buddhist traditions.",
    "id": "Himalayan Tibet Museum_Darjeeling",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Himalayan View Ridge_Bagora",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bagora",
    "name": "Himalayan View Ridge",
    "description": "Elevated ridges around Bagora offer panoramic views of valleys and Himalayan peaks."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rammam",
    "name": "Himalayan Village Walks",
    "description": "Traditional village routes showcasing local culture  architecture and mountain lifestyles.",
    "gallery": [],
    "id": "Himalayan Village Walks_Rammam",
    "category": "Village"
  },
  {
    "gallery": [],
    "id": "Historical Exhibits_Mungpoo",
    "category": "Viewpoint",
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Historical Exhibits",
    "description": "Exhibits showcasing the life of Tagore  local history  and the heritage of Mungpoo."
  },
  {
    "description": "One of the most famous wildlife viewing spots in Jaldapara.",
    "name": "Hollong Salt Lick",
    "destinationId": "Hollong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Hollong Salt Lick_Hollong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Hollong Tourist Lodge_Hollong",
    "gallery": [],
    "description": "Iconic forest lodge overlooking a wildlife salt lick.",
    "name": "Hollong Tourist Lodge",
    "destinationId": "Hollong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Hollong Tourist Lodge_Madarihat",
    "destinationId": "Madarihat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Hollong Tourist Lodge",
    "description": "Historic forest lodge and one of the best wildlife viewing locations in Jaldapara."
  },
  {
    "id": "Hollong Watch Tower_Hollong",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Hollong Watch Tower",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Hollong",
    "description": "Elevated viewing point overlooking grasslands and wildlife habitats."
  },
  {
    "description": "A cluster of village homestays offering authentic local hospitality and cultural immersion.",
    "name": "Homestay Circuit",
    "destinationId": "Lingsey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Homestay Circuit_Lingsey",
    "category": "Village",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Homestay Clusters_Tinchuley",
    "category": "Village",
    "description": "Traditional homestay areas providing authentic local hospitality and cultural immersion.",
    "destinationId": "Tinchuley",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Homestay Clusters"
  },
  {
    "id": "Homestay Experience Zone_Chimney",
    "category": "Village",
    "gallery": [],
    "description": "Traditional village stays offering authentic Himalayan hospitality and rural experiences.",
    "name": "Homestay Experience Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chimney"
  },
  {
    "description": "Traditional village homestays offering authentic local hospitality and mountain experiences.",
    "name": "Homestay Tourism",
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Homestay Tourism_Chuikhim",
    "category": "Village",
    "gallery": []
  },
  {
    "description": "A collection of village homestays offering authentic local hospitality.",
    "destinationId": "Charkhole",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Homestay Village Cluster",
    "gallery": [],
    "id": "Homestay Village Cluster_Charkhole",
    "category": "Village"
  },
  {
    "destinationId": "Dawaipani",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Homestay Village Cluster",
    "description": "A cluster of traditional homestays offering authentic local hospitality and cultural experiences.",
    "gallery": [],
    "category": "Village",
    "id": "Homestay Village Cluster_Dawaipani"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mahaldiram",
    "name": "Homestays",
    "description": "Local homestays provide immersive experiences of village life and Himalayan culture.",
    "gallery": [],
    "id": "Homestays_Mahaldiram",
    "category": "Village"
  },
  {
    "description": "One of the best locations in North Bengal to observe the Rufous-necked Hornbill and other forest birds.",
    "name": "Hornbill Viewing Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "id": "Hornbill Viewing Areas_Latpanchar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Hydel Project Area_Jhalong",
    "category": "Viewpoint",
    "description": "The hydroelectric project area is a unique attraction combining river scenery and engineering infrastructure.",
    "destinationId": "Jhalong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Hydel Project Area"
  },
  {
    "gallery": [],
    "id": "India?Nepal Border Point_Simana",
    "category": "Viewpoint",
    "description": "A popular border attraction where visitors can experience the unique atmosphere of the India?Nepal frontier.",
    "destinationId": "Simana",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "India?Nepal Border Point"
  },
  {
    "description": "A unique destination where visitors can experience the cultural and geographical significance of the Indo-Bhutan border.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bindu",
    "name": "Indo-Bhutan Border Area",
    "gallery": [],
    "id": "Indo-Bhutan Border Area_Bindu",
    "category": "Viewpoint"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Todey",
    "name": "Indo-Bhutan Border View Area",
    "description": "Landscape viewpoint near the international border.",
    "gallery": [],
    "id": "Indo-Bhutan Border View Area_Todey",
    "category": "Viewpoint"
  },
  {
    "description": "Scenic border landscape visible from the Totopara region.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Totopara",
    "name": "Indo-Bhutan Border View Area",
    "gallery": [],
    "id": "Indo-Bhutan Border View Area_Totopara",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Indo-Bhutan View Point",
    "description": "A viewpoint overlooking the border landscapes of India and Bhutan.",
    "gallery": [],
    "id": "Indo-Bhutan View Point_Todey",
    "category": "Viewpoint"
  },
  {
    "description": "A unique ridge route where visitors experience both Indian and Nepalese landscapes.",
    "destinationId": "Meghma",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Indo-Nepal Border Ridge",
    "gallery": [],
    "id": "Indo-Nepal Border Ridge_Meghma",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Jalapahar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jalapahar Cantonment Area",
    "description": "Historic military cantonment zone dating back to the British period.",
    "gallery": [],
    "id": "Jalapahar Cantonment Area_Jalapahar",
    "category": "Viewpoint"
  },
  {
    "name": "Jalapahar Forest Belt",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jalapahar",
    "description": "Forested section surrounding the ridge with scenic walking routes.",
    "id": "Jalapahar Forest Belt_Jalapahar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Jalapahar Ridge_Jalapahar",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Jalapahar Ridge",
    "destinationId": "Jalapahar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Historic ridge area providing panoramic views of Darjeeling and Kanchenjunga."
  },
  {
    "gallery": [],
    "id": "Jalapahar Viewpoints_Darjeeling",
    "category": "Viewpoint",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jalapahar Viewpoints",
    "description": "Jalapahar is known for elevated viewpoints  forested surroundings  and panoramic vistas of the Darjeeling hills."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Jaldapara National Park_Madarihat",
    "description": "One of India  s premier grassland national parks  famous for the Indian One-Horned Rhinoceros.",
    "destinationId": "Madarihat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jaldapara National Park"
  },
  {
    "description": "Visitor centre showcasing Jaldapara  s wildlife and ecosystem.",
    "destinationId": "Madarihat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jaldapara Nature Interpretation Centre",
    "gallery": [],
    "id": "Jaldapara Nature Interpretation Centre_Madarihat",
    "category": "Viewpoint"
  },
  {
    "name": "Jaldapara Safari Gate",
    "destinationId": "Madarihat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Main entry point for jeep safari operations.",
    "category": "Viewpoint",
    "id": "Jaldapara Safari Gate_Madarihat",
    "gallery": []
  },
  {
    "name": "Jaldhaka Bridge Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jaldhaka",
    "description": "Scenic photography location overlooking the river and surrounding hills.",
    "id": "Jaldhaka Bridge Viewpoint_Jaldhaka",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jaldhaka",
    "name": "Jaldhaka Hydel Project View Area",
    "description": "Popular viewpoint overlooking the hydroelectric project and river valley.",
    "gallery": [],
    "id": "Jaldhaka Hydel Project View Area_Jaldhaka",
    "category": "Viewpoint"
  },
  {
    "id": "Jaldhaka River_Bindu",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Jaldhaka River",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bindu",
    "description": "Scenic river landscapes offering photography and relaxation opportunities."
  },
  {
    "id": "Jaldhaka River_Jaldhaka",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Jaldhaka River",
    "destinationId": "Jaldhaka",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Major Himalayan river flowing through scenic valleys and forest landscapes of the Dooars."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Jaldhaka River_Jhalong",
    "destinationId": "Jhalong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jaldhaka River",
    "description": "A picturesque Himalayan river known for its clear waters  river tourism  and natural beauty."
  },
  {
    "gallery": [],
    "id": "Jaldhaka Valley Viewpoint_Bindu",
    "category": "Viewpoint",
    "description": "A panoramic viewpoint overlooking the Jaldhaka Valley and surrounding hills.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bindu",
    "name": "Jaldhaka Valley Viewpoint"
  },
  {
    "description": "Venue of the famous annual Jalpesh Mela pilgrimage fair.",
    "destinationId": "Mainaguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jalpesh Mela Ground",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Jalpesh Mela Ground_Mainaguri"
  },
  {
    "id": "Jalpesh Temple_Mainaguri",
    "category": "Monastery",
    "gallery": [],
    "name": "Jalpesh Temple",
    "destinationId": "Mainaguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "One of North Bengal  s most important Shiva temples and pilgrimage destinations."
  },
  {
    "description": "Built to promote peace and harmony  the Japanese Peace Pagoda offers tranquil surroundings and beautiful views of the hills.",
    "name": "Japanese Peace Pagoda",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Japanese Peace Pagoda_Darjeeling",
    "category": "Monastery",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Jatraprasad Watch Tower_Lataguri",
    "category": "Viewpoint",
    "destinationId": "Lataguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jatraprasad Watch Tower",
    "description": "A famous wildlife viewing tower named after the legendary elephant Jatraprasad."
  },
  {
    "gallery": [],
    "id": "Jayanti Forest_Jayanti",
    "category": "Viewpoint",
    "description": "Scenic forest zone forming part of the Buxa Tiger Reserve landscape.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jayanti",
    "name": "Jayanti Forest"
  },
  {
    "gallery": [],
    "id": "Jayanti River Access Point_Rajabhatkhawa",
    "category": "Viewpoint",
    "destinationId": "Rajabhatkhawa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jayanti River Access Point",
    "description": "Popular access route towards the Jayanti landscape and Buxa foothills."
  },
  {
    "id": "Jayanti Riverbed_Jayanti",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Iconic dry riverbed and one of the most photographed landscapes in the Dooars region.",
    "name": "Jayanti Riverbed",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jayanti"
  },
  {
    "name": "Jayanti Viewpoint Zone",
    "destinationId": "Jayanti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic observation areas overlooking the river valley and Buxa hills.",
    "category": "Viewpoint",
    "id": "Jayanti Viewpoint Zone_Jayanti",
    "gallery": []
  },
  {
    "id": "Jhalong Bridge_Jhalong",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Jhalong Bridge",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhalong",
    "description": "An iconic bridge over the Jaldhaka River offering scenic views of the river valley and surrounding forests."
  },
  {
    "gallery": [],
    "id": "Jhandi Dara Viewpoint_Lolegaon",
    "category": "Viewpoint",
    "description": "A nearby viewpoint famous for sunrise  cloud formations  and Himalayan panoramas.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lolegaon",
    "name": "Jhandi Dara Viewpoint"
  },
  {
    "description": "Farming area showcasing local agricultural practices and seasonal crops.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhepi",
    "name": "Jhepi Agricultural Belt",
    "gallery": [],
    "id": "Jhepi Agricultural Belt_Jhepi",
    "category": "Viewpoint"
  },
  {
    "description": "Scenic ridge offering panoramic views of valleys  forests and surrounding villages.",
    "destinationId": "Jhepi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jhepi Ridge Viewpoint",
    "gallery": [],
    "id": "Jhepi Ridge Viewpoint_Jhepi",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Jhepi Village Cluster_Jhepi",
    "category": "Village",
    "destinationId": "Jhepi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Jhepi Village Cluster",
    "description": "Agricultural village known for traditional rural landscapes and local culture."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Kafer Viewpoint_Kafer",
    "description": "A peaceful hilltop viewpoint offering panoramic Himalayan and valley views.",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kafer Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Kalimpong Arts & Crafts Centre_Kalimpong",
    "gallery": [],
    "description": "A center promoting local handicrafts  traditional art  and cultural heritage.",
    "name": "Kalimpong Arts & Crafts Centre",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Kalimpong Science Centre",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalimpong",
    "description": "An interactive science center offering educational exhibits and panoramic hill views.",
    "id": "Kalimpong Science Centre_Kalimpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Kaljani Riverfront_Alipurduar",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Kaljani Riverfront",
    "destinationId": "Alipurduar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic riverbank area near the town offering photography and leisure opportunities."
  },
  {
    "name": "Kanchenjunga Panorama",
    "destinationId": "Sandakphu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A breathtaking panoramic view of the Kanchenjunga massif.",
    "id": "Kanchenjunga Panorama_Sandakphu",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Kanchenjunga View Areas_Kolakham",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Kanchenjunga View Areas",
    "destinationId": "Kolakham",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic locations providing spectacular views of Kanchenjunga and surrounding Himalayan peaks."
  },
  {
    "gallery": [],
    "id": "Kanchenjunga View Areas_Peshok",
    "category": "Viewpoint",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kanchenjunga View Areas",
    "description": "Select viewpoints providing distant views of the Kanchenjunga range on clear days."
  },
  {
    "id": "Kanchenjunga View Corridor_Dawaipani",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A series of viewpoints offering uninterrupted views of the Kanchenjunga massif.",
    "name": "Kanchenjunga View Corridor",
    "destinationId": "Dawaipani",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Kanchenjunga View Corridor_Delo",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic viewing areas offering clear views of Kanchenjunga and surrounding Himalayan peaks.",
    "name": "Kanchenjunga View Corridor",
    "destinationId": "Delo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Kanchenjunga View Corridor_Lolegaon",
    "category": "Viewpoint",
    "destinationId": "Lolegaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kanchenjunga View Corridor",
    "description": "Select locations providing spectacular views of Kanchenjunga and surrounding peaks."
  },
  {
    "name": "Kanchenjunga View Corridor",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic locations providing views of Kanchenjunga and surrounding Himalayan ranges.",
    "id": "Kanchenjunga View Corridor_Sillery Gaon",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "A dedicated viewing area providing spectacular panoramic views of the Kanchenjunga massif and the Eastern Himalayas.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ahaldara",
    "name": "Kanchenjunga View Deck",
    "gallery": [],
    "id": "Kanchenjunga View Deck_Ahaldara",
    "category": "Viewpoint"
  },
  {
    "description": "A dedicated viewpoint offering clear views of Kanchenjunga and neighboring peaks.",
    "name": "Kanchenjunga View Deck",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Charkhole",
    "id": "Kanchenjunga View Deck_Charkhole",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Kanchenjunga View Deck_Icchey Gaon",
    "category": "Viewpoint",
    "description": "A dedicated viewpoint offering panoramic views of Kanchenjunga and surrounding peaks.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Icchey Gaon",
    "name": "Kanchenjunga View Deck"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Kanchenjunga View Deck_Lamahatta",
    "description": "A viewpoint offering spectacular views of Kanchenjunga and the surrounding Himalayan ranges.",
    "destinationId": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kanchenjunga View Deck"
  },
  {
    "description": "Dedicated viewing area for Kanchenjunga and surrounding peaks.",
    "name": "Kanchenjunga View Deck",
    "destinationId": "Mankhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Kanchenjunga View Deck_Mankhim",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Kanchenjunga View Deck_Rikisum",
    "category": "Viewpoint",
    "description": "A dedicated viewpoint offering unobstructed views of the Kanchenjunga massif and surrounding Himalayan peaks.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rikisum",
    "name": "Kanchenjunga View Deck"
  },
  {
    "id": "Kanchenjunga View Deck_Rishop",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Kanchenjunga View Deck",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A dedicated viewpoint providing clear views of the Kanchenjunga massif and surrounding peaks."
  },
  {
    "description": "A scenic location offering clear views of Kanchenjunga and surrounding Himalayan peaks.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Algarah",
    "name": "Kanchenjunga View Point",
    "gallery": [],
    "id": "Kanchenjunga View Point_Algarah",
    "category": "Viewpoint"
  },
  {
    "name": "Kanchenjunga View Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chuikhim",
    "description": "Scenic viewpoints providing clear views of Kanchenjunga and surrounding mountain ranges.",
    "id": "Kanchenjunga View Point_Chuikhim",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Kanchenjunga View Point_Lingsey",
    "gallery": [],
    "name": "Kanchenjunga View Point",
    "destinationId": "Lingsey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A scenic location offering clear views of Kanchenjunga and surrounding Himalayan ranges."
  },
  {
    "category": "Viewpoint",
    "id": "Kanchenjunga View Point_Ramdhura",
    "gallery": [],
    "description": "A scenic location offering clear views of Kanchenjunga and surrounding Himalayan peaks on clear days.",
    "name": "Kanchenjunga View Point",
    "destinationId": "Ramdhura",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Kanchenjunga View Zones_Kafer",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kanchenjunga View Zones",
    "description": "Scenic spots providing spectacular views of Kanchenjunga and nearby peaks."
  },
  {
    "description": "Multiple viewing areas providing clear views of Kanchenjunga and surrounding Himalayan peaks.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "name": "Kanchenjunga View Zones",
    "gallery": [],
    "id": "Kanchenjunga View Zones_Lepchajagat",
    "category": "Viewpoint"
  },
  {
    "description": "Traditional villages and agricultural landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Karandighi",
    "name": "Karandighi Village Cluster",
    "gallery": [],
    "id": "Karandighi Village Cluster_Karandighi",
    "category": "Village"
  },
  {
    "name": "Karandighi Wetland Complex",
    "destinationId": "Karandighi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Seasonal wetland supporting migratory and resident bird species.",
    "id": "Karandighi Wetland Complex_Karandighi",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Khunia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Khunia Watch Tower",
    "description": "Important watch tower in the Gorumara landscape for observing rhinos  gaur  elephants  and birds.",
    "gallery": [],
    "id": "Khunia Watch Tower_Khunia",
    "category": "Viewpoint"
  },
  {
    "category": "Village",
    "id": "Kodalbasti Eco Village_Kodalbasti",
    "gallery": [],
    "name": "Kodalbasti Eco Village",
    "destinationId": "Kodalbasti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest-fringe village offering homestay and eco-tourism experiences near Chilapata."
  },
  {
    "id": "Kulik Bird Observation Tower_Raiganj",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Kulik Bird Observation Tower",
    "destinationId": "Raiganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Observation tower offering panoramic views of nesting colonies and wetland habitats."
  },
  {
    "description": "Visitor centre providing information on sanctuary ecology and birdlife.",
    "name": "Kulik Bird Sanctuary Nature Interpretation Centre",
    "destinationId": "Raiganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Kulik Bird Sanctuary Nature Interpretation Centre_Raiganj",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Kulik Eco Park_Raiganj",
    "destinationId": "Raiganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kulik Eco Park",
    "description": "Recreational and environmental education area adjacent to the sanctuary."
  },
  {
    "name": "Kulik Riverside Zone",
    "destinationId": "Raiganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Riverside area along the Kulik River associated with bird habitats and nature walks.",
    "id": "Kulik Riverside Zone_Raiganj",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Scenic border region near Assam and Bhutan with rural landscapes and cultural diversity.",
    "name": "Kumargram Border Region",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kumargram",
    "id": "Kumargram Border Region_Kumargram",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Kumargram Village Cluster_Kumargram",
    "category": "Village",
    "destinationId": "Kumargram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Kumargram Village Cluster",
    "description": "Traditional villages showcasing local culture and rural lifestyles."
  },
  {
    "gallery": [],
    "id": "Kurseong Railway Station_Kurseong",
    "category": "Viewpoint",
    "description": "Kurseong Railway Station is a historic stop on the UNESCO-listed Darjeeling Himalayan Railway and remains a key heritage attraction.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Kurseong Railway Station"
  },
  {
    "id": "Kushmandi Wooden Mask Craft Village_Kushmandi",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Kushmandi Wooden Mask Craft Village",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kushmandi",
    "description": "Famous centre of traditional wooden mask making used in folk performances and rituals."
  },
  {
    "gallery": [],
    "id": "Lakeside Pine Forest_Mirik",
    "category": "Viewpoint",
    "description": "A peaceful pine forest surrounding the lake  ideal for nature walks  photography  and family outings.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "name": "Lakeside Pine Forest"
  },
  {
    "category": "Viewpoint",
    "id": "Lakeside Promenade_Mirik",
    "gallery": [],
    "description": "A scenic walkway around Sumendu Lake offering beautiful views  relaxation spots  and photography opportunities.",
    "name": "Lakeside Promenade",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Lamahatta Eco Park_Lamahatta",
    "description": "Lamahatta Eco Park is the signature attraction of Lamahatta  featuring landscaped gardens  pine forests  and scenic walking trails.",
    "destinationId": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Lamahatta Eco Park"
  },
  {
    "description": "Scenic viewpoint overlooking the iconic Lampokhari Lake.",
    "name": "Lampokhari Lake Viewpoint",
    "destinationId": "Mankhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Lampokhari Lake Viewpoint_Mankhim",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Forest trails known for sightings of various Himalayan laughingthrush species.",
    "name": "Laughingthrush Habitat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "id": "Laughingthrush Habitat_Lepchajagat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Lava Monastery",
    "destinationId": "Lava",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A peaceful Buddhist monastery overlooking the forests of Lava  known for its spiritual atmosphere and mountain views.",
    "id": "Lava Monastery_Lava",
    "category": "Monastery",
    "gallery": []
  },
  {
    "name": "Lava Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lava",
    "description": "A scenic viewpoint offering panoramic views of forests  valleys  and distant Himalayan peaks.",
    "id": "Lava Viewpoint_Lava",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Lepcha Heritage Areas_Pedong",
    "category": "Viewpoint",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Lepcha Heritage Areas",
    "description": "Locations showcasing the traditions  history  and cultural heritage of the Lepcha community."
  },
  {
    "category": "Viewpoint",
    "id": "Lepcha Museum_Kalimpong",
    "gallery": [],
    "name": "Lepcha Museum",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A museum preserving the history  traditions  and culture of the Lepcha community."
  },
  {
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Lepchajagat Viewpoint",
    "description": "A tranquil viewpoint offering magnificent views of Kanchenjunga  forested ridges  and Himalayan landscapes.",
    "gallery": [],
    "id": "Lepchajagat Viewpoint_Lepchajagat",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Buxa Fort",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Lepchakha Viewpoint",
    "description": "Famous ridge-top viewpoint offering spectacular views of the Dooars plains.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Lepchakha Viewpoint_Buxa Fort"
  },
  {
    "category": "Viewpoint",
    "id": "Lepchakha Viewpoint_Lepchakha",
    "gallery": [],
    "name": "Lepchakha Viewpoint",
    "destinationId": "Lepchakha",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Famous ridge-top viewpoint offering one of the best panoramas of the Dooars plains."
  },
  {
    "gallery": [],
    "id": "Lepchakha Village_Lepchakha",
    "category": "Village",
    "destinationId": "Lepchakha",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Lepchakha Village",
    "description": "Remote hill village known for traditional lifestyles and scenic mountain settings."
  },
  {
    "description": "Forest area surrounding the village with rich biodiversity.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lingse",
    "name": "Lingse Forest Belt",
    "gallery": [],
    "id": "Lingse Forest Belt_Lingse",
    "category": "Viewpoint"
  },
  {
    "name": "Lingse Ridge Viewpoint",
    "destinationId": "Lingse",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Mountain ridge viewpoint overlooking valleys and forests.",
    "category": "Viewpoint",
    "id": "Lingse Ridge Viewpoint_Lingse",
    "gallery": []
  },
  {
    "description": "Scenic Himalayan village known for eco-tourism and community-based tourism.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lingse",
    "name": "Lingse Village",
    "gallery": [],
    "id": "Lingse Village_Lingse",
    "category": "Village"
  },
  {
    "description": "A peaceful Himalayan village known for its traditional lifestyle  scenic beauty  and homestay experiences.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lingsey",
    "name": "Lingsey Village",
    "gallery": [],
    "id": "Lingsey Village_Lingsey",
    "category": "Village"
  },
  {
    "id": "Lingtam Ridge Area_Lingtam",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Mountain ridge area offering panoramic landscapes and nature experiences.",
    "name": "Lingtam Ridge Area",
    "destinationId": "Lingtam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Scenic viewpoint overlooking surrounding valleys and Himalayan landscapes.",
    "name": "Lingtam Viewpoint",
    "destinationId": "Lingtam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Lingtam Viewpoint_Lingtam",
    "gallery": []
  },
  {
    "description": "Traditional village located on the old Silk Route circuit of East Sikkim.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lingtam",
    "name": "Lingtam Village",
    "gallery": [],
    "id": "Lingtam Village_Lingtam",
    "category": "Village"
  },
  {
    "id": "Little Rangit Viewpoint_Singla",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Little Rangit Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Singla",
    "description": "Scenic viewpoint overlooking the Little Rangit valley and surrounding hills."
  },
  {
    "id": "Lloyd Botanical Garden_Darjeeling",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Lloyd Botanical Garden",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Lloyd Botanical Garden houses a rich collection of Himalayan flora  orchids  and rare plant species."
  },
  {
    "gallery": [],
    "id": "Local Market_Algarah",
    "category": "Viewpoint",
    "description": "A traditional hill market showcasing local produce  handicrafts  and daily village life.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Algarah",
    "name": "Local Market"
  },
  {
    "description": "Traditional marketplace reflecting local Dooars culture.",
    "name": "Local Market",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dhupguri",
    "id": "Local Market_Dhupguri",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Local Market_Mainaguri",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Traditional market serving local communities and visitors.",
    "name": "Local Market",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mainaguri"
  },
  {
    "id": "Local Market_Manebhanjan",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A bustling market serving trekkers and visitors with local products  food  and supplies.",
    "name": "Local Market",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Manebhanjan"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Local Market_Rongli",
    "description": "A vibrant local market showcasing regional products  handicrafts  and daily hill life.",
    "destinationId": "Rongli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Local Market"
  },
  {
    "description": "A lively market area where visitors can explore local products and border-town culture.",
    "destinationId": "Simana",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Local Market",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Local Market_Simana"
  },
  {
    "destinationId": "Malbazar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Local Markets",
    "description": "Traditional markets showcasing local produce  tea products  handicrafts  and regional culture.",
    "gallery": [],
    "id": "Local Markets_Malbazar",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Local Monasteries Circuit",
    "description": "A collection of smaller monasteries that showcase Buddhist culture  traditions  and Himalayan spirituality.",
    "gallery": [],
    "category": "Monastery",
    "id": "Local Monasteries Circuit_Kurseong"
  },
  {
    "gallery": [],
    "id": "Local Monasteries Circuit_Mirik",
    "category": "Monastery",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Local Monasteries Circuit",
    "description": "A collection of smaller monasteries showcasing Buddhist traditions  local culture  and Himalayan spirituality."
  },
  {
    "description": "Visitors can explore traditional Himalayan villages and local culture around Rimbik.",
    "name": "Local Village Tourism",
    "destinationId": "Rimbik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Local Village Tourism_Rimbik",
    "category": "Village",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Lovers Meet Viewpoint_Takdah",
    "gallery": [],
    "name": "Lovers Meet Viewpoint",
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A famous viewpoint near Takdah offering panoramic views of valleys and mountain landscapes."
  },
  {
    "category": "Village",
    "id": "Lower Sittong_Sittong",
    "gallery": [],
    "description": "Lower Sittong is known for riverside landscapes  orange cultivation  and traditional Himalayan village life.",
    "name": "Lower Sittong",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "MacFarlane Memorial Church_Kalimpong",
    "category": "Monastery",
    "gallery": [],
    "name": "MacFarlane Memorial Church",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalimpong",
    "description": "A historic church showcasing beautiful architecture and the colonial heritage of Kalimpong."
  },
  {
    "id": "Madan Mohan Temple_Cooch Behar",
    "category": "Monastery",
    "gallery": [],
    "description": "Historic temple and one of the most important spiritual sites in the district.",
    "name": "Madan Mohan Temple",
    "destinationId": "Cooch Behar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Mahakal Cave_Mahakal Cave",
    "category": "Monastery",
    "gallery": [],
    "description": "Sacred cave shrine located near the Bhutan border and one of the most popular treks from Jayanti.",
    "name": "Mahakal Cave",
    "destinationId": "Mahakal Cave",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Mahakal Temple Complex",
    "destinationId": "Mahakal Cave",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Hindu-Buddhist cave temple complex situated inside the cave system.",
    "category": "Monastery",
    "id": "Mahakal Temple Complex_Mahakal Cave",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Mahakal Temple_Darjeeling",
    "category": "Monastery",
    "description": "Mahakal Temple is a revered religious site where Hindu and Buddhist traditions coexist  attracting pilgrims throughout the year.",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mahakal Temple"
  },
  {
    "description": "Mountain viewpoint overlooking surrounding valleys and Bhutan hills.",
    "destinationId": "Mahakal Cave",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mahakal Viewpoint",
    "gallery": [],
    "id": "Mahakal Viewpoint_Mahakal Cave",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mahaldiram Ridge",
    "description": "Mahaldiram Ridge offers spectacular sunrise views  tea garden scenery  and expansive Himalayan panoramas.",
    "gallery": [],
    "id": "Mahaldiram Ridge_Kurseong",
    "category": "Viewpoint"
  },
  {
    "name": "Mahaldiram Sunrise Point",
    "destinationId": "Mahaldiram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A famous sunrise location offering panoramic Himalayan vistas and tea garden scenery.",
    "category": "Viewpoint",
    "id": "Mahaldiram Sunrise Point_Mahaldiram",
    "gallery": []
  },
  {
    "description": "Forest sections supporting elephants  birds  and wildlife movement.",
    "name": "Mahananda Forest Edge",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sevoke Corridor",
    "id": "Mahananda Forest Edge_Sevoke Corridor",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Latpanchar serves as one of the primary access points to Mahananda Wildlife Sanctuary  known for rich biodiversity and forest ecosystems.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "name": "Mahananda Wildlife Sanctuary Access",
    "gallery": [],
    "id": "Mahananda Wildlife Sanctuary Access_Latpanchar",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Makaibari Tea Estate_Kurseong",
    "gallery": [],
    "description": "Makaibari Tea Estate is one of the oldest and most renowned tea estates in India  famous for organic tea production  heritage bungalows  and immersive tea tourism experiences.",
    "name": "Makaibari Tea Estate",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Makaibari Tea Estate_Makaibari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Makaibari Tea Estate is one of India  s oldest and most celebrated tea estates  internationally known for organic tea production and heritage tea tourism.",
    "name": "Makaibari Tea Estate",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Makaibari"
  },
  {
    "name": "Mal Tea Estate Belt",
    "destinationId": "Malbazar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Historic tea garden landscapes representing the heart of Dooars tea culture.",
    "category": "Viewpoint",
    "id": "Mal Tea Estate Belt_Malbazar",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Mangal Dham Temple_Kalimpong",
    "category": "Monastery",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mangal Dham Temple",
    "description": "A prominent temple complex attracting pilgrims and visitors interested in religious architecture."
  },
  {
    "name": "Mankhim Sunrise Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mankhim",
    "description": "Popular sunrise location with Himalayan mountain views.",
    "id": "Mankhim Sunrise Point_Mankhim",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Mankhim Viewpoint_Mankhim",
    "category": "Viewpoint",
    "description": "One of East Sikkim  s best viewpoints overlooking Lampokhari Lake  Aritar and the Kanchenjunga range.",
    "destinationId": "Mankhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mankhim Viewpoint"
  },
  {
    "description": "Margaret  s Hope is internationally recognized for producing premium Darjeeling tea and offers breathtaking plantation views.",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Margaret  s Hope Tea Estate",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Margaret  s Hope Tea Estate_Kurseong"
  },
  {
    "description": "Margaret  s Hope Tea Estate is internationally recognized for producing some of the finest Darjeeling tea varieties.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Margaret  s Hope",
    "name": "Margaret  s Hope Tea Estate",
    "gallery": [],
    "id": "Margaret  s Hope Tea Estate_Margaret  s Hope",
    "category": "Viewpoint"
  },
  {
    "description": "Sabargram is known for its open meadows surrounded by forests and mountain ridges  creating a unique high-altitude landscape.",
    "destinationId": "Sabargram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Meadow Landscapes",
    "gallery": [],
    "id": "Meadow Landscapes_Sabargram",
    "category": "Viewpoint"
  },
  {
    "description": "Quiet areas designed for meditation  relaxation  and peaceful nature experiences.",
    "name": "Meditation Zones",
    "destinationId": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Meditation Zones_Lamahatta",
    "gallery": []
  },
  {
    "description": "One of the most popular watchtowers in Gorumara for spotting rhinoceros  elephants  and gaur.",
    "name": "Medla Watch Tower",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lataguri",
    "id": "Medla Watch Tower_Lataguri",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Meghma Monastery_Meghma",
    "category": "Monastery",
    "gallery": [],
    "name": "Meghma Monastery",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Meghma",
    "description": "A serene monastery located near the India?Nepal border with beautiful mountain surroundings."
  },
  {
    "gallery": [],
    "id": "Mekhliganj Border Region_Mekhliganj",
    "category": "Viewpoint",
    "description": "Border landscape and cultural interaction zone near the Bangladesh frontier.",
    "destinationId": "Mekhliganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mekhliganj Border Region"
  },
  {
    "description": "Forest zone known for elephant sightings and nature tourism.",
    "name": "Mendabari Forest Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chilapata",
    "id": "Mendabari Forest Area_Chilapata",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Migratory Bird Observation Deck_Gajoldoba",
    "category": "Viewpoint",
    "description": "Dedicated viewing zones for observing migratory waterfowl and wetland birds.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gajoldoba",
    "name": "Migratory Bird Observation Deck"
  },
  {
    "gallery": [],
    "id": "Mirik Market Area_Mirik",
    "category": "Viewpoint",
    "description": "The local market provides insight into the culture  cuisine  and daily life of the Mirik region.",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mirik Market Area"
  },
  {
    "name": "Mirik Orange Orchards",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "description": "Mirik  s orange orchards are among the most famous in North Bengal  attracting visitors during the harvest season.",
    "id": "Mirik Orange Orchards_Mirik",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "name": "Mirik Ridge Walk",
    "description": "A scenic walking route offering panoramic views of forests  tea gardens  and surrounding valleys.",
    "gallery": [],
    "id": "Mirik Ridge Walk_Mirik",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Mirik Tea Gardens_Mirik",
    "category": "Viewpoint",
    "description": "The tea estates surrounding Mirik offer scenic landscapes and opportunities to experience Darjeeling tea culture.",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mirik Tea Gardens"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "name": "Mirik View Point",
    "description": "Mirik View Point offers panoramic views of Sumendu Lake  surrounding tea gardens  and mountain landscapes.",
    "gallery": [],
    "id": "Mirik View Point_Mirik",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Monastery Prayer Wheel Area_Durpin",
    "category": "Monastery",
    "description": "A peaceful section around the monastery featuring prayer wheels and spiritual ambience.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Durpin",
    "name": "Monastery Prayer Wheel Area"
  },
  {
    "name": "Mongpong Birding Trail",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mongpong",
    "description": "Dedicated birdwatching trails through forest and riverside habitats.",
    "id": "Mongpong Birding Trail_Mongpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Morgan House",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A colonial-era mansion known for its Scottish architecture  heritage value  and scenic location.",
    "id": "Morgan House_Kalimpong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Rikisum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain Landscapes",
    "description": "Open mountain ridges  forests  and valleys create spectacular Himalayan scenery throughout the region.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Mountain Landscapes_Rikisum"
  },
  {
    "gallery": [],
    "id": "Mountain Photography Points_Pedong",
    "category": "Viewpoint",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain Photography Points",
    "description": "Scenic spots ideal for capturing landscapes  monasteries  and heritage structures."
  },
  {
    "description": "Popular locations for mountain  sunrise  and valley photography.",
    "name": "Mountain Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sillery Gaon",
    "id": "Mountain Photography Points_Sillery Gaon",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Ridge-top roads offering spectacular views of hills  forests  and distant mountain ranges.",
    "name": "Mountain Ridge Roads",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Algarah",
    "id": "Mountain Ridge Roads_Algarah",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Trek",
    "id": "Mountain Ridge Trails_Sittong",
    "gallery": [],
    "name": "Mountain Ridge Trails",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Ridge-top walking trails offering panoramic views of valleys  forests  and distant mountains."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pabong",
    "name": "Mountain Ridge Viewpoint",
    "description": "Elevated viewpoint offering panoramic views of valleys and mountain ridges.",
    "gallery": [],
    "id": "Mountain Ridge Viewpoint_Pabong",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Mountain Ridge Walk_Kalipokhri",
    "category": "Trek",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalipokhri",
    "name": "Mountain Ridge Walk",
    "description": "A scenic ridge walk connecting major points on the Sandakphu trail."
  },
  {
    "gallery": [],
    "id": "Mountain Ridge Walks_Ramdhura",
    "category": "Viewpoint",
    "description": "Scenic ridge-top walking routes connecting viewpoints  forests  and village landscapes.",
    "destinationId": "Ramdhura",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain Ridge Walks"
  },
  {
    "description": "Scenic ridge walks offering panoramic mountain views and peaceful surroundings.",
    "name": "Mountain Ridge Walks",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tinchuley",
    "id": "Mountain Ridge Walks_Tinchuley",
    "category": "Trek",
    "gallery": []
  },
  {
    "name": "Mountain Roads",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Winding mountain roads offering dramatic valley views  forest scenery  and photography opportunities.",
    "category": "Viewpoint",
    "id": "Mountain Roads_Peshok",
    "gallery": []
  },
  {
    "id": "Mountain Routes_Rongli",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Mountain Routes",
    "destinationId": "Rongli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Mountain roads connecting Rongli with East Sikkim and Kalimpong  offering spectacular landscapes."
  },
  {
    "destinationId": "Lolegaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain View Areas",
    "description": "Scenic locations offering panoramic views of valleys and snow-clad Himalayan peaks.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Mountain View Areas_Lolegaon"
  },
  {
    "gallery": [],
    "id": "Mountain View Areas_Manebhanjan",
    "category": "Viewpoint",
    "destinationId": "Manebhanjan",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain View Areas",
    "description": "Scenic viewpoints overlooking valleys  forests  and surrounding Himalayan ridges."
  },
  {
    "id": "Mountain View Areas_Rimbik",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic viewpoints around Rimbik offering views of valleys  forests  and Himalayan ridges.",
    "name": "Mountain View Areas",
    "destinationId": "Rimbik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Mountain View Deck_Delo",
    "category": "Viewpoint",
    "description": "A dedicated viewing platform providing panoramic Himalayan and valley landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Delo",
    "name": "Mountain View Deck"
  },
  {
    "destinationId": "Simana",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain View Deck",
    "description": "The view deck offers expansive views of valleys  hills  and distant Himalayan landscapes.",
    "gallery": [],
    "id": "Mountain View Deck_Simana",
    "category": "Viewpoint"
  },
  {
    "description": "Elevated viewpoints offering panoramic views of valleys  forests  and Himalayan ridges.",
    "name": "Mountain Viewpoints",
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Mountain Viewpoints_Mungpoo",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Scenic locations offering panoramic views of valleys  forests  and Himalayan ridges.",
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain Viewpoints",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Mountain Viewpoints_Munsong"
  },
  {
    "gallery": [],
    "id": "Mountain Viewpoints_Paren",
    "category": "Viewpoint",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain Viewpoints",
    "description": "Elevated viewpoints offering panoramic views of valleys  forests  and distant Himalayan ranges."
  },
  {
    "name": "Mountain Views",
    "destinationId": "Gitdubling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic viewpoints overlooking valleys  forests  and Himalayan foothills.",
    "id": "Mountain Views_Gitdubling",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Mountain Views_Gopaldhara",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gopaldhara",
    "name": "Mountain Views",
    "description": "Scenic viewpoints within the estate offer panoramic views of valleys and distant Himalayan peaks."
  },
  {
    "category": "Viewpoint",
    "id": "Mountain Views_Mahaldiram",
    "gallery": [],
    "description": "Mahaldiram offers spectacular views of valleys  tea estates  and the distant Himalayas.",
    "name": "Mountain Views",
    "destinationId": "Mahaldiram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Mountain-Foothill Landscape_Chalsa",
    "description": "Unique transition zone between Himalayan foothills and Dooars plains.",
    "destinationId": "Chalsa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Mountain-Foothill Landscape"
  },
  {
    "description": "Village artisan community preserving centuries-old mask-making traditions.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kushmandi",
    "name": "Mukha Shilpa Artisan Cluster",
    "gallery": [],
    "id": "Mukha Shilpa Artisan Cluster_Kushmandi",
    "category": "Viewpoint"
  },
  {
    "description": "A popular photography location overlooking the Murti River and surrounding forests.",
    "name": "Murti Bridge Viewpoint",
    "destinationId": "Murti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Murti Bridge Viewpoint_Murti",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Murti Forest Edge_Chapramari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Forest sections connecting Chapramari with the Murti-Gorumara landscape.",
    "name": "Murti Forest Edge",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chapramari"
  },
  {
    "description": "Easy access to the scenic Murti River  a popular destination for relaxation and photography.",
    "name": "Murti River Access",
    "destinationId": "Lataguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Murti River Access_Lataguri",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Murti River Rocky Stretch_Rocky Island",
    "category": "Viewpoint",
    "description": "Scenic stretch of the Murti River surrounded by forests and large rock formations.",
    "destinationId": "Rocky Island",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Murti River Rocky Stretch"
  },
  {
    "id": "Murti River Viewpoint_Samsing",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic viewpoint overlooking the Murti River and surrounding forest landscape.",
    "name": "Murti River Viewpoint",
    "destinationId": "Samsing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Murti River",
    "destinationId": "Murti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A beautiful Himalayan river flowing through forests and wildlife habitats  famous for scenic landscapes and relaxation.",
    "category": "Viewpoint",
    "id": "Murti River_Murti",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Murti Riverside Zone_Rocky Island",
    "gallery": [],
    "description": "Scenic riverside area surrounding Rocky Island.",
    "name": "Murti Riverside Zone",
    "destinationId": "Rocky Island",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Nagrakata Tea Estate Circuit_Nagrakata",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A circuit connecting several prominent tea estates around Nagrakata.",
    "name": "Nagrakata Tea Estate Circuit",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Nagrakata"
  },
  {
    "destinationId": "Chilapata",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Nalraja Garh",
    "description": "Ruins of an ancient fort hidden within the Chilapata forest  associated with the Koch Kingdom.",
    "gallery": [],
    "category": "Monastery",
    "id": "Nalraja Garh_Chilapata"
  },
  {
    "gallery": [],
    "id": "Namthing Pokhri_Namthing",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Namthing",
    "name": "Namthing Pokhri",
    "description": "A high-altitude wetland ecosystem famous for its ecological importance and unique biodiversity."
  },
  {
    "description": "Open meadows suitable for camping and outdoor activities.",
    "name": "Nature Camping Meadows",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Nature Camping Meadows_Kafer",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Nature Camping Meadows_Reshikhola",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Nature Camping Meadows",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Open riverside meadows suitable for camping and outdoor recreation."
  },
  {
    "id": "Nature Camps_Paren",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Nature Camps",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Camping areas surrounded by forests and natural scenery."
  },
  {
    "gallery": [],
    "id": "Nature Education Corridor_Namthing",
    "category": "Viewpoint",
    "destinationId": "Namthing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Nature Education Corridor",
    "description": "A nature-learning trail designed for students  researchers  and eco-tourists."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Nature Interpretation Area_Lamahatta",
    "description": "Educational nature zones helping visitors understand local ecology  flora  and fauna.",
    "destinationId": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Nature Interpretation Area"
  },
  {
    "id": "Nature Interpretation Centre_Lataguri",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Nature Interpretation Centre",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lataguri",
    "description": "An educational center introducing visitors to the flora  fauna  and ecosystems of Gorumara National Park."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lava",
    "name": "Nature Interpretation Centre",
    "description": "An educational center introducing visitors to the ecology  wildlife  and conservation significance of Neora Valley.",
    "gallery": [],
    "id": "Nature Interpretation Centre_Lava",
    "category": "Viewpoint"
  },
  {
    "id": "Nature Interpretation Centre_Rajabhatkhawa",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Educational centre showcasing the ecology and wildlife of Buxa.",
    "name": "Nature Interpretation Centre",
    "destinationId": "Rajabhatkhawa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Nature Interpretation Trail_Chuikhim",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Nature Interpretation Trail",
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Educational trails highlighting local ecology  forests  and biodiversity."
  },
  {
    "description": "A nature trail highlighting local flora  fauna  and ecological features.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Icchey Gaon",
    "name": "Nature Interpretation Trail",
    "gallery": [],
    "id": "Nature Interpretation Trail_Icchey Gaon",
    "category": "Viewpoint"
  },
  {
    "id": "Nature Interpretation Trail_Lingsey",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Educational trails highlighting local biodiversity and ecological significance.",
    "name": "Nature Interpretation Trail",
    "destinationId": "Lingsey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Guided nature trails through forests and wildlife habitats.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dhupjhora",
    "name": "Nature Trails",
    "gallery": [],
    "id": "Nature Trails_Dhupjhora",
    "category": "Viewpoint"
  },
  {
    "description": "Forest and countryside trails suitable for exploration.",
    "destinationId": "Mateli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Nature Trails",
    "gallery": [],
    "id": "Nature Trails_Mateli",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Nature Walk Routes_Mirik",
    "category": "Viewpoint",
    "description": "Scenic walking routes through forests  orchards  and hillside landscapes suitable for all age groups.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "name": "Nature Walk Routes"
  },
  {
    "description": "Scenic nature trails following rivers  forests  and mountain landscapes.",
    "name": "Nature Walks",
    "destinationId": "Srikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Nature Walks_Srikhola",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Nayabasti Forest Route_Nayabasti",
    "gallery": [],
    "name": "Nayabasti Forest Route",
    "destinationId": "Nayabasti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest pathway connecting the village with nearby nature and walking areas."
  },
  {
    "gallery": [],
    "id": "Nayabasti Valley Viewpoint_Nayabasti",
    "category": "Viewpoint",
    "description": "Local viewpoint overlooking surrounding hills and valleys.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Nayabasti",
    "name": "Nayabasti Valley Viewpoint"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Nayabasti",
    "name": "Nayabasti Village Cluster",
    "description": "Traditional Himalayan village offering authentic local lifestyle experiences and scenic surroundings.",
    "gallery": [],
    "id": "Nayabasti Village Cluster_Nayabasti",
    "category": "Village"
  },
  {
    "category": "Viewpoint",
    "id": "Neora Forest Edge Trail_Lava",
    "gallery": [],
    "description": "A forest trail leading toward the buffer zone of Neora Valley National Park.",
    "name": "Neora Forest Edge Trail",
    "destinationId": "Lava",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "category": "Viewpoint",
    "id": "Neora Forest Trails_Kolakham",
    "gallery": [],
    "description": "Walking routes through biodiversity-rich forests near Neora Valley National Park.",
    "name": "Neora Forest Trails",
    "destinationId": "Kolakham",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Kolakham serves as one of the most important access points to Neora Valley National Park and its wilderness areas.",
    "name": "Neora Valley Access",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kolakham",
    "id": "Neora Valley Access_Kolakham",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Neora Valley Buffer Forest_Suntalekhola",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Neora Valley Buffer Forest",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Suntalekhola",
    "description": "Forest fringe area providing access to the biodiversity of Neora Valley National Park."
  },
  {
    "description": "Scenic viewpoint overlooking the foothills of Neora Valley National Park.",
    "destinationId": "Samsing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Neora Valley Foothill Viewpoint",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Neora Valley Foothill Viewpoint_Samsing"
  },
  {
    "gallery": [],
    "id": "Neora Valley National Park Gate_Lava",
    "category": "Viewpoint",
    "description": "The primary gateway to Neora Valley National Park  one of Eastern India  s richest biodiversity hotspots.",
    "destinationId": "Lava",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Neora Valley National Park Gate"
  },
  {
    "description": "This museum preserves the legacy of Netaji Subhas Chandra Bose and showcases his connection with Kurseong.",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Netaji Subhas Chandra Bose Museum",
    "gallery": [],
    "id": "Netaji Subhas Chandra Bose Museum_Kurseong",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "New Town Park Urban Recreation Area_Alipurduar",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Alipurduar",
    "name": "New Town Park / Urban Recreation Area",
    "description": "Recreational green spaces within Alipurduar town."
  },
  {
    "description": "Nightingale Park offers panoramic views  landscaped gardens  and a peaceful environment near the town centre.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "name": "Nightingale Park",
    "gallery": [],
    "id": "Nightingale Park_Darjeeling",
    "category": "Viewpoint"
  },
  {
    "destinationId": "North Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "North Point Observatory Area",
    "description": "Elevated ridge offering views of Darjeeling town and surrounding Himalayan landscapes.",
    "gallery": [],
    "id": "North Point Observatory Area_North Point",
    "category": "Viewpoint"
  },
  {
    "description": "Scenic mountain viewpoint overlooking valleys and forested slopes.",
    "name": "North Point Ridge Viewpoint",
    "destinationId": "North Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "North Point Ridge Viewpoint_North Point",
    "gallery": []
  },
  {
    "description": "North Point offers scenic views of Darjeeling town  surrounding hills  and the Himalayan landscape.",
    "name": "North Point View Area",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "North Point View Area_Darjeeling",
    "gallery": []
  },
  {
    "id": "Observatory Hill_Darjeeling",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Observatory Hill is a historic hilltop destination known for panoramic views and the sacred Mahakal Temple  attracting both pilgrims and tourists.",
    "name": "Observatory Hill",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Okayti Tea Estate_Darjeeling",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Okayti Tea Estate is renowned for tea cultivation  colonial heritage  and picturesque Himalayan landscapes.",
    "name": "Okayti Tea Estate",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Old Colonial Structures",
    "destinationId": "Chimney",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Colonial-era structures preserve the architectural and cultural legacy of the region.",
    "category": "Viewpoint",
    "id": "Old Colonial Structures_Chimney",
    "gallery": []
  },
  {
    "name": "Orange Festival Zone",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Areas associated with seasonal orange harvest celebrations and local community events.",
    "category": "Viewpoint",
    "id": "Orange Festival Zone_Sittong",
    "gallery": []
  },
  {
    "description": "These viewpoints provide scenic vistas of Mirik  s famous orange orchards and surrounding mountain landscapes.",
    "name": "Orange Garden Viewpoints",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Orange Garden Viewpoints_Mirik",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orange Harvest Festival",
    "description": "Seasonal celebrations associated with orange harvesting in nearby hill villages.",
    "gallery": [],
    "id": "Orange Harvest Festival_Lepchajagat",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orange Orchards",
    "description": "Mirik is famous for its orange orchards  especially during winter when the fruit-laden trees create beautiful landscapes.",
    "gallery": [],
    "id": "Orange Orchards_Mirik",
    "category": "Viewpoint"
  },
  {
    "description": "Sittong is famous as the Orange Village of Darjeeling  with extensive orange orchards covering the surrounding hillsides.",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orange Orchards",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Orange Orchards_Sittong"
  },
  {
    "gallery": [],
    "id": "Orange Orchards_Tinchuley",
    "category": "Viewpoint",
    "destinationId": "Tinchuley",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orange Orchards",
    "description": "Seasonal orange orchards that attract visitors during harvest season and provide scenic countryside experiences."
  },
  {
    "destinationId": "Tingling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orange Orchards",
    "description": "Seasonal orange orchards attract visitors during winter and showcase the agricultural heritage of the region.",
    "gallery": [],
    "id": "Orange Orchards_Tingling",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Orange Processing & Farm Experience_Sittong",
    "category": "Viewpoint",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orange Processing & Farm Experience",
    "description": "Visitors can learn about orange cultivation  harvesting  and local agricultural practices."
  },
  {
    "name": "Orchid Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ramdhura",
    "description": "Forest sections and gardens known for seasonal orchid blooms and Himalayan flora.",
    "id": "Orchid Areas_Ramdhura",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Orchid Bloom_Lepchajagat",
    "category": "Viewpoint",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orchid Bloom",
    "description": "Wild orchids bloom across forest sections  enhancing biodiversity and scenic beauty."
  },
  {
    "id": "Orchid Centre_Takdah",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A center showcasing orchids and Himalayan flora  attracting plant enthusiasts and photographers.",
    "name": "Orchid Centre",
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Orchid Centres",
    "description": "Centers dedicated to orchid cultivation and conservation  displaying a wide variety of Himalayan orchids.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Orchid Centres_Kalimpong"
  },
  {
    "id": "Organic Farms_Tinchuley",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Organic Farms",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tinchuley",
    "description": "Organic farms showcasing sustainable agriculture and local farming practices."
  },
  {
    "description": "Scenic waterfall surroundings offering peaceful natural landscapes and photography opportunities.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pabong",
    "name": "Pabong Waterfall Area",
    "gallery": [],
    "id": "Pabong Waterfall Area_Pabong",
    "category": "Waterfall"
  },
  {
    "description": "India  s premier high-altitude zoo  famous for snow leopards  red pandas  Himalayan wolves  and conservation programs.",
    "name": "Padmaja Naidu Himalayan Zoological Park",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Padmaja Naidu Himalayan Zoological Park_Darjeeling",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Pankhasari Birding Zone_Pankhasari",
    "category": "Viewpoint",
    "description": "Important bird-watching area supporting Himalayan and foothill bird species.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pankhasari",
    "name": "Pankhasari Birding Zone"
  },
  {
    "description": "Forested landscape surrounding the viewpoint with rich biodiversity.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pankhasari",
    "name": "Pankhasari Forest Belt",
    "gallery": [],
    "id": "Pankhasari Forest Belt_Pankhasari",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Pankhasari Viewpoint_Pankhasari",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pankhasari",
    "name": "Pankhasari Viewpoint",
    "description": "High-altitude viewpoint offering panoramic views of the Teesta Valley  forests and Himalayan foothills."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Paragliding Launch Site_Delo",
    "description": "One of the most famous paragliding launch points in North Bengal  offering aerial views of Kalimpong and the Teesta Valley.",
    "destinationId": "Delo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Paragliding Launch Site"
  },
  {
    "category": "Viewpoint",
    "id": "Paren Birding Zone_Paren",
    "gallery": [],
    "description": "Forest-edge birding area known among birdwatchers visiting the Dooars.",
    "name": "Paren Birding Zone",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Popular walking trail through forest landscapes and bird habitats.",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Paren Forest Trail",
    "gallery": [],
    "id": "Paren Forest Trail_Paren",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Paren Viewpoint_Paren",
    "category": "Viewpoint",
    "description": "Observation point overlooking forested valleys and mountain landscapes.",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Paren Viewpoint"
  },
  {
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Paren Village",
    "description": "Scenic hill village known for forests  birdlife and peaceful surroundings.",
    "gallery": [],
    "category": "Village",
    "id": "Paren Village_Paren"
  },
  {
    "gallery": [],
    "id": "Patiram Village Cluster_Patiram",
    "category": "Village",
    "description": "Traditional village landscape showcasing agriculture and rural life in South Dinajpur.",
    "destinationId": "Patiram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Patiram Village Cluster"
  },
  {
    "gallery": [],
    "id": "Peshok Tea Estate_Peshok",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Peshok",
    "name": "Peshok Tea Estate",
    "description": "A historic tea-growing area known for beautiful plantation landscapes and Darjeeling tea heritage."
  },
  {
    "description": "One of the most scenic viewpoints in the Darjeeling hills  offering panoramic views of the Teesta Valley and surrounding mountains.",
    "name": "Peshok Viewpoint",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Peshok Viewpoint_Peshok",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Phalut Peak",
    "destinationId": "Phalut",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Phalut Peak is one of the highest trekking destinations in Eastern India  offering spectacular Himalayan views.",
    "id": "Phalut Peak_Phalut",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Ahaldara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Photography Deck",
    "description": "A dedicated photography location popular for capturing sunrise  sunset  and Himalayan landscapes.",
    "gallery": [],
    "id": "Photography Deck_Ahaldara",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Bagora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Photography Points",
    "description": "Scenic locations throughout Bagora provide opportunities for landscape and forest photography.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Photography Points_Bagora"
  },
  {
    "description": "Popular locations for landscape photography and mountain panoramas.",
    "destinationId": "Charkhole",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Photography Points",
    "gallery": [],
    "id": "Photography Points_Charkhole",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Photography Points_Durpin",
    "category": "Viewpoint",
    "description": "Designated locations ideal for landscape and monastery photography.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Durpin",
    "name": "Photography Points"
  },
  {
    "category": "Viewpoint",
    "id": "Photography Points_Gayabari",
    "gallery": [],
    "name": "Photography Points",
    "destinationId": "Gayabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic locations ideal for capturing toy trains  tea gardens  and mountain scenery."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Soureni",
    "name": "Photography Points",
    "description": "Scenic locations throughout Soureni provide excellent opportunities for landscape and tea garden photography.",
    "gallery": [],
    "id": "Photography Points_Soureni",
    "category": "Viewpoint"
  },
  {
    "id": "Photography Season_Lepchajagat",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Photography Season",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "description": "Autumn provides ideal weather and visibility for landscape and wildlife photography."
  },
  {
    "description": "A favorite location for capturing panoramic mountain scenery and border landscapes.",
    "name": "Photography Spot",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Simana",
    "id": "Photography Spot_Simana",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Photography Spots_Ambotia",
    "description": "Popular viewpoints and plantation areas offering excellent opportunities for landscape and tea garden photography.",
    "destinationId": "Ambotia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Photography Spots"
  },
  {
    "name": "Phuguri Tea Estate",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "description": "Phuguri Tea Estate is a historic plantation destination known for quality tea and scenic hillside surroundings.",
    "id": "Phuguri Tea Estate_Darjeeling",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Pine Forest Ridge Walk_Rishop",
    "category": "Viewpoint",
    "description": "Ridge-top trails through pine forests connecting viewpoints and nature areas.",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Pine Forest Ridge Walk"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Pine Forest Sections_Kurseong",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Pine Forest Sections",
    "description": "The pine forests of Kurseong create a tranquil atmosphere and are among the most photographed natural attractions in the region."
  },
  {
    "id": "Pine Forest Trail_Mirik",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A popular walking trail passing through dense pine forests  offering peaceful nature experiences.",
    "name": "Pine Forest Trail",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Pine Forest Trails_Lamahatta",
    "category": "Viewpoint",
    "description": "Scenic forest trails passing through dense pine woods and natural landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lamahatta",
    "name": "Pine Forest Trails"
  },
  {
    "description": "Scenic walking trails through dense pine forests known for their peaceful atmosphere and natural beauty.",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Pine Forest Trails",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Pine Forest Trails_Lepchajagat"
  },
  {
    "id": "Pine Forest Trails_Sillery Gaon",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Walking trails passing through pine forests and scenic landscapes.",
    "name": "Pine Forest Trails",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Pine Forest Walks",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bagora",
    "description": "Walking trails through pine forests provide a peaceful nature experience.",
    "id": "Pine Forest Walks_Bagora",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Dense pine forests surrounding the village provide scenic walks and nature experiences.",
    "name": "Pine Forest",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Charkhole",
    "id": "Pine Forest_Charkhole",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Dense pine forests surrounding the village provide tranquil walking routes and scenic landscapes.",
    "name": "Pine Forest",
    "destinationId": "Dawaipani",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Pine Forest_Dawaipani",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Pine Forest_Rikisum",
    "category": "Viewpoint",
    "description": "Dense pine forests surrounding the village provide peaceful walking trails and nature experiences.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rikisum",
    "name": "Pine Forest"
  },
  {
    "gallery": [],
    "id": "Pine Forest_Takdah",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Takdah",
    "name": "Pine Forest",
    "description": "Dense pine forests offering nature walks  photography  and peaceful surroundings."
  },
  {
    "id": "Pine View Nursery_Kalimpong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A renowned nursery famous for its extensive collection of cacti and ornamental plants.",
    "name": "Pine View Nursery",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Pine View Ridge_Kalimpong",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalimpong",
    "name": "Pine View Ridge",
    "description": "A scenic ridge offering views of forests  valleys  and the Himalayan landscape."
  },
  {
    "id": "Plantation Heritage Routes_Malbazar",
    "category": "Monastery",
    "gallery": [],
    "name": "Plantation Heritage Routes",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Malbazar",
    "description": "Routes connecting historic tea estates and colonial-era tea infrastructure."
  },
  {
    "id": "Plantation Photography Points_Mungpoo",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Plantation Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mungpoo",
    "description": "Popular locations for capturing cinchona plantations  mountain scenery  and heritage landscapes."
  },
  {
    "category": "Viewpoint",
    "id": "Plantation Photography Points_Munsong",
    "gallery": [],
    "description": "Scenic viewpoints and plantation landscapes ideal for photography.",
    "name": "Plantation Photography Points",
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Scenic locations for capturing tea gardens and Himalayan foothill scenery.",
    "name": "Plantation Photography Points",
    "destinationId": "Odlabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Plantation Photography Points_Odlabari",
    "gallery": []
  },
  {
    "id": "Plantation Photography Routes_Nagrakata",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic routes passing through tea estates and forest landscapes.",
    "name": "Plantation Photography Routes",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Nagrakata"
  },
  {
    "description": "A scenic ridge overlooking tea estates and surrounding Himalayan foothills.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Thurbo",
    "name": "Plantation View Ridge",
    "gallery": [],
    "id": "Plantation View Ridge_Thurbo",
    "category": "Viewpoint"
  },
  {
    "id": "Plantation Viewpoints_Castleton",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Plantation Viewpoints",
    "destinationId": "Castleton",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic points overlooking tea gardens  valleys  and distant Himalayan ridges."
  },
  {
    "description": "Walking routes through tea gardens and natural surroundings.",
    "name": "Plantation Walking Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Damdim",
    "id": "Plantation Walking Trails_Damdim",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Plantation Walks_Margaret  s Hope",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Plantation Walks",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Margaret  s Hope",
    "description": "Guided walks through tea plantations provide scenic views and insights into tea cultivation."
  },
  {
    "gallery": [],
    "id": "Poobong Homestay Village_Poobong",
    "category": "Village",
    "description": "Village tourism area offering traditional homestay experiences.",
    "destinationId": "Poobong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Poobong Homestay Village"
  },
  {
    "id": "Poobong Riverside Trail_Poobong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Riverside route running through the Poobong valley.",
    "name": "Poobong Riverside Trail",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Poobong"
  },
  {
    "name": "Poobong Tea Estate",
    "destinationId": "Poobong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Picturesque tea estate known for tranquil landscapes and tea cultivation.",
    "id": "Poobong Tea Estate_Poobong",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Prayer Flag Area_Kalipokhri",
    "category": "Monastery",
    "gallery": [],
    "name": "Prayer Flag Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalipokhri",
    "description": "A colorful prayer flag zone overlooking the surrounding mountains."
  },
  {
    "description": "This hilltop area adorned with colorful prayer flags provides panoramic views and a spiritual ambiance.",
    "destinationId": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Prayer Flag Hill",
    "gallery": [],
    "category": "Monastery",
    "id": "Prayer Flag Hill_Lamahatta"
  },
  {
    "description": "A ridge adorned with colorful prayer flags offering panoramic views of the surrounding mountains.",
    "name": "Prayer Flags Ridge",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Chitrey",
    "id": "Prayer Flags Ridge_Chitrey",
    "category": "Monastery",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchakha",
    "name": "Pukhri Hill View Area",
    "description": "Lesser-known viewpoint on trekking routes around Lepchakha.",
    "gallery": [],
    "id": "Pukhri Hill View Area_Lepchakha",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Punarbhaba Riverfront_Gangarampur",
    "destinationId": "Gangarampur",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Punarbhaba Riverfront",
    "description": "Scenic river stretch passing through the Gangarampur region."
  },
  {
    "gallery": [],
    "id": "Rabindra Bhavan_Mungpoo",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mungpoo",
    "name": "Rabindra Bhavan",
    "description": "The historic residence where Rabindranath Tagore spent several visits  now preserved as a cultural heritage site."
  },
  {
    "id": "Raidak River View Area_Kumargram",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Raidak River View Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kumargram",
    "description": "Popular river landscape associated with the Kumargram region."
  },
  {
    "gallery": [],
    "id": "Raiganj Wildlife Sanctuary (Kulik Bird Sanctuary)_Raiganj",
    "category": "Viewpoint",
    "description": "India  s second-largest bird sanctuary and one of the most important nesting sites for Asian Openbill Storks.",
    "destinationId": "Raiganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Raiganj Wildlife Sanctuary (Kulik Bird Sanctuary)"
  },
  {
    "description": "This railway museum showcases the history  engineering  and heritage of the famous Darjeeling Himalayan Railway.",
    "destinationId": "Ghum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Railway Heritage Museum",
    "gallery": [],
    "id": "Railway Heritage Museum_Ghum",
    "category": "Viewpoint"
  },
  {
    "description": "A scenic section of the Darjeeling Himalayan Railway known for classic hill railway photography.",
    "destinationId": "Gayabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Railway Heritage Stretch",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Railway Heritage Stretch_Gayabari"
  },
  {
    "gallery": [],
    "id": "Railway Photography Points_Kurseong",
    "category": "Viewpoint",
    "description": "Dedicated photography locations along the railway route provide excellent opportunities to capture the toy train and mountain scenery.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kurseong",
    "name": "Railway Photography Points"
  },
  {
    "gallery": [],
    "id": "Rainbow Bridge (Indreni Pull)_Mirik",
    "category": "Viewpoint",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rainbow Bridge (Indreni Pull)",
    "description": "The iconic Rainbow Bridge connects both sides of Sumendu Lake and serves as Mirik  s most recognizable landmark."
  },
  {
    "description": "Conservation centre displaying Himalayan and Dooars orchid species.",
    "destinationId": "Rajabhatkhawa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rajabhatkhawa Orchidarium",
    "gallery": [],
    "id": "Rajabhatkhawa Orchidarium_Rajabhatkhawa",
    "category": "Viewpoint"
  },
  {
    "description": "Royal estate complex associated with the former princely state of Cooch Behar.",
    "destinationId": "Cooch Behar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rajbari Complex",
    "gallery": [],
    "id": "Rajbari Complex_Cooch Behar",
    "category": "Monastery"
  },
  {
    "name": "Ramdhura Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ramdhura",
    "description": "A peaceful viewpoint offering panoramic views of the Teesta Valley  forests  and surrounding Himalayan hills.",
    "id": "Ramdhura Viewpoint_Ramdhura",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Rameetay Dara is one of the finest viewpoints near Mirik  providing expansive views of valleys  forests  and distant Himalayan peaks.",
    "name": "Rameetay Dara View Point",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Rameetay Dara View Point_Mirik",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Ramitey View Point_Sillery Gaon",
    "gallery": [],
    "description": "One of the most famous viewpoints in Kalimpong district  offering sweeping views of the Teesta River  s winding course.",
    "name": "Ramitey View Point",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Rammam River_Rammam",
    "category": "Viewpoint",
    "gallery": [],
    "description": "The scenic Rammam River is one of the most beautiful natural attractions along the Singalila trekking circuit.",
    "name": "Rammam River",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rammam"
  },
  {
    "name": "Rangbull Forest Route",
    "destinationId": "Rangbull",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest corridor connecting Rangbull with nearby villages and viewpoints.",
    "id": "Rangbull Forest Route_Rangbull",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Community-based tourism area with local homestays.",
    "name": "Rangbull Homestay Village",
    "destinationId": "Rangbull",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Rangbull Homestay Village_Rangbull",
    "category": "Village",
    "gallery": []
  },
  {
    "destinationId": "Rangbull",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rangbull Tea Garden",
    "description": "Tea-growing area surrounded by forests and mountain scenery.",
    "gallery": [],
    "id": "Rangbull Tea Garden_Rangbull",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Rangbull Viewpoint_Rangbull",
    "description": "Scenic location overlooking valleys and tea gardens.",
    "destinationId": "Rangbull",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rangbull Viewpoint"
  },
  {
    "description": "Seasonal opportunities to observe one of India  s rarest amphibian species in its natural habitat.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Namthing",
    "name": "Rare Himalayan Salamander Viewing",
    "gallery": [],
    "id": "Rare Himalayan Salamander Viewing_Namthing",
    "category": "Viewpoint"
  },
  {
    "id": "Rasik Beel Boating Zone_Rasik Beel",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Designated boating area allowing visitors to explore parts of the wetland.",
    "name": "Rasik Beel Boating Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rasik Beel"
  },
  {
    "id": "Rasik Beel Nature Interpretation Centre_Rasik Beel",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Visitor centre providing information on wetland ecology and birdlife.",
    "name": "Rasik Beel Nature Interpretation Centre",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rasik Beel"
  },
  {
    "description": "Observation tower offering excellent views of the wetland and bird habitats.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rasik Beel",
    "name": "Rasik Beel Watch Tower",
    "gallery": [],
    "id": "Rasik Beel Watch Tower_Rasik Beel",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Rasik Beel",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rasik Beel Wetland Complex",
    "description": "One of North Bengal  s most important freshwater wetlands and a major habitat for resident and migratory birds.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Rasik Beel Wetland Complex_Rasik Beel"
  },
  {
    "id": "Rasik Bil Bird Sanctuary_Cooch Behar",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Rasik Bil Bird Sanctuary",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Cooch Behar",
    "description": "Important wetland and bird habitat near Cooch Behar."
  },
  {
    "id": "Red Panda Habitat Area_Gairibas",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Red Panda Habitat Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gairibas",
    "description": "One of the important habitats of the endangered red panda within Singalila National Park."
  },
  {
    "gallery": [],
    "id": "Reshi River_Reshi",
    "category": "Viewpoint",
    "destinationId": "Reshi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Reshi River",
    "description": "Scenic river flowing along the Sikkim?West Bengal border  popular for nature tourism."
  },
  {
    "category": "Viewpoint",
    "id": "Reshi Riverside Zone_Reshi",
    "gallery": [],
    "name": "Reshi Riverside Zone",
    "destinationId": "Reshi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Riverside tourism area offering scenic landscapes and river access."
  },
  {
    "id": "Reshi Suspension Bridge_Reshi",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Reshi Suspension Bridge",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Reshi",
    "description": "Important crossing point and local landmark over the Reshi River."
  },
  {
    "description": "A beautiful mountain river forming the border between West Bengal and Sikkim  known for its crystal-clear waters and tranquil surroundings.",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Reshikhola River",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Reshikhola River_Reshikhola"
  },
  {
    "gallery": [],
    "id": "Rhino Observation Zone_Gorumara",
    "category": "Viewpoint",
    "description": "Prime wildlife viewing area where Indian One-Horned Rhinoceros are commonly spotted.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gorumara",
    "name": "Rhino Observation Zone"
  },
  {
    "description": "A key area for observing Indian one-horned rhinoceros.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Khunia",
    "name": "Rhino Observation Zone",
    "gallery": [],
    "id": "Rhino Observation Zone_Khunia",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Rhino Observation Zones_Lataguri",
    "description": "Prime grassland habitats where Indian one-horned rhinoceros are frequently sighted.",
    "destinationId": "Lataguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rhino Observation Zones"
  },
  {
    "id": "Rhino Sighting Area_Batabari",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Rhino Sighting Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Batabari",
    "description": "Areas known for frequent rhinoceros sightings."
  },
  {
    "description": "High-altitude rhododendron forests that bloom spectacularly during spring.",
    "name": "Rhododendron Belt",
    "destinationId": "Phalut",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Rhododendron Belt_Phalut",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Dense forests famous for blooming rhododendrons during spring.",
    "name": "Rhododendron Forest",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gairibas",
    "id": "Rhododendron Forest_Gairibas",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Ridge Nature Walk_Lepchajagat",
    "category": "Viewpoint",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Ridge Nature Walk",
    "description": "A ridge-top walking route connecting viewpoints and forest sections."
  },
  {
    "id": "Ridge Photography Point_Kafer",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A scenic ridge location ideal for sunrise and mountain photography.",
    "name": "Ridge Photography Point",
    "destinationId": "Kafer",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "Ridge Photography Points_Bikeybhanjang",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic locations for capturing Himalayan landscapes and trekking routes.",
    "name": "Ridge Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Bikeybhanjang"
  },
  {
    "id": "Rikisum Viewpoint_Rikisum",
    "category": "Viewpoint",
    "gallery": [],
    "description": "One of the finest viewpoints in the Kalimpong hills  offering panoramic views of Kanchenjunga  forested ridges  and surrounding valleys.",
    "name": "Rikisum Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rikisum"
  },
  {
    "id": "Rimbik Bazaar_Rimbik",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Rimbik Bazaar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rimbik",
    "description": "The traditional marketplace of Rimbik serving trekkers and local communities with supplies  food  and local products."
  },
  {
    "category": "Viewpoint",
    "id": "Rishop Viewpoint_Rishop",
    "gallery": [],
    "description": "One of the finest viewpoints in Kalimpong district  offering panoramic Himalayan vistas.",
    "name": "Rishop Viewpoint",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Access routes leading to nearby rivers and streams.",
    "destinationId": "Mateli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "River Access Routes",
    "gallery": [],
    "id": "River Access Routes_Mateli",
    "category": "Viewpoint"
  },
  {
    "description": "Popular locations for river  bridge  and mountain photography.",
    "name": "River Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sevoke Corridor",
    "id": "River Photography Points_Sevoke Corridor",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "River Valley Photography Points_Rongli",
    "gallery": [],
    "name": "River Valley Photography Points",
    "destinationId": "Rongli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic locations for capturing river valleys and mountain scenery."
  },
  {
    "description": "River valleys surrounded by forests and mountains providing scenic beauty and nature experiences.",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "River Valleys",
    "gallery": [],
    "category": "Viewpoint",
    "id": "River Valleys_Todey"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "River View Deck_Jhalong",
    "destinationId": "Jhalong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "River View Deck",
    "description": "A scenic platform overlooking the Jaldhaka River and surrounding valleys."
  },
  {
    "gallery": [],
    "id": "River View Deck_Reshikhola",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Reshikhola",
    "name": "River View Deck",
    "description": "Elevated viewpoints overlooking the Reshikhola River and surrounding valleys."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Murti",
    "name": "Riverbed Nature Walk",
    "description": "Walking experiences along the riverbed and nearby forest corridors.",
    "gallery": [],
    "id": "Riverbed Nature Walk_Murti",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Riverine Forest Trails_Chapramari",
    "category": "Viewpoint",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riverine Forest Trails",
    "description": "Forest trails along streams and riverine habitats supporting diverse wildlife."
  },
  {
    "gallery": [],
    "id": "Riverside Area_Gorkhey",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gorkhey",
    "name": "Riverside Area",
    "description": "Peaceful riverside zones ideal for relaxation  photography  and nature experiences."
  },
  {
    "destinationId": "Nagrakata",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riverside Areas",
    "description": "Scenic riverbanks and streams flowing through tea gardens and forests.",
    "gallery": [],
    "id": "Riverside Areas_Nagrakata",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Riverside Areas_Rimbik",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rimbik",
    "name": "Riverside Areas",
    "description": "Scenic riverside locations offering relaxation  photography  and nature experiences."
  },
  {
    "description": "Scenic riverside locations offering relaxation  photography  and nature experiences.",
    "name": "Riverside Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rongli",
    "id": "Riverside Areas_Rongli",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gitdubling",
    "name": "Riverside Camping Areas",
    "description": "Peaceful camping locations beside rivers surrounded by forests and natural scenery.",
    "gallery": [],
    "id": "Riverside Camping Areas_Gitdubling",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Riverside Camping Areas_Todey",
    "description": "Scenic camping locations beside rivers and forested valleys.",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riverside Camping Areas"
  },
  {
    "name": "Riverside Camping Zone",
    "destinationId": "Rammam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Designated riverside camping area offering nature stays beside the Rammam River.",
    "id": "Riverside Camping Zone_Rammam",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Riverside Camping_Murti",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Camping areas beside the river providing nature and outdoor experiences.",
    "name": "Riverside Camping",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Murti"
  },
  {
    "id": "Riverside Camping_Reshikhola",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Popular camping areas located along the riverbank  offering nature and outdoor experiences.",
    "name": "Riverside Camping",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Riverside Camping_Srikhola",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Srikhola",
    "name": "Riverside Camping",
    "description": "Scenic camping area located beside the Srikhola River amidst forests and mountain landscapes."
  },
  {
    "id": "Riverside Nature Trails_Jogighat",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Walking trails along the riverbanks passing through forests and rural landscapes.",
    "name": "Riverside Nature Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jogighat"
  },
  {
    "id": "Riverside Nature Walks_Paren",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Riverside Nature Walks",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Paren",
    "description": "Walking routes connecting forests  streams  and mountain landscapes."
  },
  {
    "id": "Riverside Photography Points_Jhalong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic riverside locations popular for landscape and nature photography.",
    "name": "Riverside Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jhalong"
  },
  {
    "id": "Riverside Photography Points_Mongpong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic locations ideal for river  forest  and wildlife photography.",
    "name": "Riverside Photography Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mongpong"
  },
  {
    "description": "Scenic locations for capturing river landscapes  forests  and mountain scenery.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Reshikhola",
    "name": "Riverside Photography Points",
    "gallery": [],
    "id": "Riverside Photography Points_Reshikhola",
    "category": "Viewpoint"
  },
  {
    "name": "Riverside Picnic Area",
    "destinationId": "Murti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Popular picnic spots located along the riverbank amidst forests and mountain scenery.",
    "id": "Riverside Picnic Area_Murti",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Riverside Picnic Areas_Bindu",
    "category": "Viewpoint",
    "description": "Peaceful picnic locations beside the river and forest corridors.",
    "destinationId": "Bindu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riverside Picnic Areas"
  },
  {
    "description": "Peaceful riverside locations ideal for picnics  relaxation  and enjoying the natural beauty of the Teesta Valley region.",
    "destinationId": "Jogighat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riverside Picnic Areas",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Riverside Picnic Areas_Jogighat"
  },
  {
    "description": "Traditional settlements located along the river valley.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jaldhaka",
    "name": "Riverside Settlement Zone",
    "gallery": [],
    "id": "Riverside Settlement Zone_Jaldhaka",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Gitdubling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riverside Trails",
    "description": "Scenic walking trails following rivers and streams through forests and mountain landscapes.",
    "gallery": [],
    "id": "Riverside Trails_Gitdubling",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Riyang River_Sittong",
    "category": "Viewpoint",
    "description": "A scenic river flowing through the Sittong region  popular for relaxation  photography  and nature experiences.",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Riyang River"
  },
  {
    "category": "Viewpoint",
    "id": "Rock Garden_Darjeeling",
    "gallery": [],
    "name": "Rock Garden",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Rock Garden is a landscaped hillside attraction featuring waterfalls  terraced gardens  and scenic viewpoints."
  },
  {
    "id": "Rocky Island Adventure Zone_Rocky Island",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Area popular for outdoor recreation and river-based activities.",
    "name": "Rocky Island Adventure Zone",
    "destinationId": "Rocky Island",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Riverside camping zone popular among nature lovers and adventure travellers.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rocky Island",
    "name": "Rocky Island Camping Ground",
    "gallery": [],
    "id": "Rocky Island Camping Ground_Rocky Island",
    "category": "Viewpoint"
  },
  {
    "name": "Rocky Island Riverbed",
    "destinationId": "Rocky Island",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Rocky stretch of the Murti River known for adventure and camping.",
    "id": "Rocky Island Riverbed_Rocky Island",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Rocky Island Viewpoint_Rocky Island",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Photography point overlooking the river valley and surrounding forests.",
    "name": "Rocky Island Viewpoint",
    "destinationId": "Rocky Island",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Popular riverside destination on the Murti River known for boulder landscapes and adventure activities.",
    "name": "Rocky Island",
    "destinationId": "Rocky Island",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Rocky Island_Rocky Island",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Rocky Island_Samsing",
    "category": "Viewpoint",
    "description": "Riverside destination famous for rock climbing  camping and nature activities.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Samsing",
    "name": "Rocky Island"
  },
  {
    "description": "Rohini Forest is a scenic woodland area known for dense greenery  biodiversity  and peaceful Himalayan foothill landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rohini",
    "name": "Rohini Forest",
    "gallery": [],
    "id": "Rohini Forest_Rohini",
    "category": "Viewpoint"
  },
  {
    "name": "Rohini Scenic Drive",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "The Rohini route is one of the most beautiful mountain roads in North Bengal  offering dramatic valley views and forest landscapes.",
    "category": "Viewpoint",
    "id": "Rohini Scenic Drive_Kurseong",
    "gallery": []
  },
  {
    "name": "Rohini Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rohini",
    "description": "Rohini Viewpoint offers panoramic views of the plains  valleys  and winding mountain roads leading into the hills.",
    "id": "Rohini Viewpoint_Rohini",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "category": "Viewpoint",
    "id": "Rongli Viewpoint_Rongli",
    "gallery": [],
    "description": "A scenic viewpoint overlooking valleys  rivers  and surrounding mountain ranges.",
    "name": "Rongli Viewpoint",
    "destinationId": "Rongli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Rufous-necked Hornbill Habitat_Lepchajagat",
    "category": "Viewpoint",
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rufous-necked Hornbill Habitat",
    "description": "Forest habitats supporting one of the most sought-after bird species in the Eastern Himalayas."
  },
  {
    "description": "One of the most historic tea estates in the region  known for premium Darjeeling tea and scenic landscapes.",
    "name": "Rungli Rungliot Tea Estate",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Takdah",
    "id": "Rungli Rungliot Tea Estate_Takdah",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Scenic agricultural landscapes showcasing rural life in the Himalayan foothills.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tangta",
    "name": "Rural Landscapes",
    "gallery": [],
    "id": "Rural Landscapes_Tangta",
    "category": "Village"
  },
  {
    "gallery": [],
    "id": "Rural Tourism Circuits_Dhupguri",
    "category": "Village",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dhupguri",
    "name": "Rural Tourism Circuits",
    "description": "Village routes showcasing local life and agricultural traditions."
  },
  {
    "id": "Rural Tourism Routes_Mainaguri",
    "category": "Village",
    "gallery": [],
    "name": "Rural Tourism Routes",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mainaguri",
    "description": "Routes passing through villages and agricultural landscapes."
  },
  {
    "description": "Traditional village experiences showcasing local culture  agriculture  and rural Himalayan life.",
    "name": "Rural Tourism",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Pabong",
    "id": "Rural Tourism_Pabong",
    "category": "Village",
    "gallery": []
  },
  {
    "description": "Traditional villages offering local culture and rural experiences.",
    "destinationId": "Damdim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Rural Villages",
    "gallery": [],
    "id": "Rural Villages_Damdim",
    "category": "Village"
  },
  {
    "id": "Sacred Kalipokhri Lake_Kalipokhri",
    "category": "Monastery",
    "gallery": [],
    "description": "A sacred black-water lake revered by both Hindus and Buddhists.",
    "name": "Sacred Kalipokhri Lake",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalipokhri"
  },
  {
    "category": "Monastery",
    "id": "Sacred Lake_Lamahatta",
    "gallery": [],
    "description": "A peaceful man-made lake surrounded by prayer flags and forests  offering a tranquil atmosphere for visitors.",
    "name": "Sacred Lake",
    "destinationId": "Lamahatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "destinationId": "Lataguri",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Safari Booking Centre",
    "description": "The main booking facility for jeep safaris and wildlife tourism activities in Gorumara.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Safari Booking Centre_Lataguri"
  },
  {
    "category": "Viewpoint",
    "id": "Safari Routes_Batabari",
    "gallery": [],
    "description": "Forest routes used for wildlife safaris and nature exploration.",
    "name": "Safari Routes",
    "destinationId": "Batabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "destinationId": "Cooch Behar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sagar Dighi",
    "description": "Historic water body surrounded by important civic and heritage structures.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sagar Dighi_Cooch Behar"
  },
  {
    "description": "Natural and artificial salt lick areas attracting deer  gaur  elephants  and other wildlife.",
    "name": "Salt Lick Observation Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gorumara",
    "id": "Salt Lick Observation Area_Gorumara",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Samsing Orange Orchard Belt_Samsing",
    "description": "Seasonal orange-growing region famous during winter months.",
    "destinationId": "Samsing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Samsing Orange Orchard Belt"
  },
  {
    "name": "Samsing Orange Orchards",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Samsing",
    "description": "Seasonal orange-growing areas offering rural tourism and photography opportunities.",
    "id": "Samsing Orange Orchards_Samsing",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Samsing Tea Estate_Samsing",
    "category": "Viewpoint",
    "description": "Scenic tea estate surrounded by forests and Himalayan foothills  one of the signature attractions of Samsing.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Samsing",
    "name": "Samsing Tea Estate"
  },
  {
    "category": "Viewpoint",
    "id": "Samsing Tea Garden_Samsing",
    "gallery": [],
    "name": "Samsing Tea Garden",
    "destinationId": "Samsing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic tea estate landscape forming the gateway to Suntalekhola and Neora Valley."
  },
  {
    "gallery": [],
    "id": "Samsing Viewpoint_Samsing",
    "category": "Viewpoint",
    "destinationId": "Samsing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Samsing Viewpoint",
    "description": "Scenic viewpoint overlooking tea gardens and forested valleys."
  },
  {
    "destinationId": "Samsing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Samsing Village",
    "description": "Picturesque Himalayan foothill village with tea and orchard landscapes.",
    "gallery": [],
    "category": "Village",
    "id": "Samsing Village_Samsing"
  },
  {
    "destinationId": "Ghum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Samten Choeling Monastery",
    "description": "A peaceful Buddhist monastery known for its spiritual atmosphere  prayer halls  and scenic surroundings.",
    "gallery": [],
    "id": "Samten Choeling Monastery_Ghum",
    "category": "Monastery"
  },
  {
    "category": "Viewpoint",
    "id": "Sandakphu Summit_Sandakphu",
    "gallery": [],
    "name": "Sandakphu Summit",
    "destinationId": "Sandakphu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "The highest point in West Bengal  offering one of the finest mountain panoramas in Asia."
  },
  {
    "name": "Sangchen Dorjee Monastery",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A historic Buddhist monastery serving as an important spiritual and cultural center in the region.",
    "id": "Sangchen Dorjee Monastery_Pedong",
    "category": "Monastery",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Santalabari Forest Camp Area_Santalabari",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Santalabari",
    "name": "Santalabari Forest Camp Area",
    "description": "Forest-fringe area popular among trekkers entering Buxa Reserve."
  },
  {
    "id": "Santalabari Trek Base_Santalabari",
    "category": "Trek",
    "gallery": [],
    "description": "Main starting point for treks to Buxa Fort and Lepchakha.",
    "name": "Santalabari Trek Base",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Santalabari"
  },
  {
    "gallery": [],
    "id": "Scenic Mountain Road_Rohini",
    "category": "Viewpoint",
    "description": "The Rohini route is one of North Bengal  s most picturesque mountain roads  popular among photographers and road-trip enthusiasts.",
    "destinationId": "Rohini",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Scenic Mountain Road"
  },
  {
    "id": "Scenic Viewpoints_Damdim",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Viewpoints overlooking tea estates and foothill landscapes.",
    "name": "Scenic Viewpoints",
    "destinationId": "Damdim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Seasonal Flower Gardens",
    "description": "Seasonal flower gardens add color to the landscape and attract photographers and nature lovers.",
    "gallery": [],
    "id": "Seasonal Flower Gardens_Sittong",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Seasonal Orchid Areas_Latpanchar",
    "category": "Viewpoint",
    "description": "Forest sections where wild Himalayan orchids bloom seasonally.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Latpanchar",
    "name": "Seasonal Orchid Areas"
  },
  {
    "id": "Seasonal Waterfalls_Lepchajagat",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Seasonal Waterfalls",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "description": "Numerous temporary waterfalls emerge during the monsoon season across forested slopes."
  },
  {
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Seeyok Tea Estate",
    "description": "Seeyok Tea Estate offers rolling tea gardens  mountain views  and an authentic plantation environment.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Seeyok Tea Estate_Darjeeling"
  },
  {
    "destinationId": "Sevoke Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sevoke Kali Mandir",
    "description": "A well-known hill temple visited by travelers crossing the Sevoke corridor.",
    "gallery": [],
    "id": "Sevoke Kali Mandir_Sevoke Corridor",
    "category": "Monastery"
  },
  {
    "gallery": [],
    "id": "Shrubbery Nightingale Area_Darjeeling",
    "category": "Viewpoint",
    "description": "This scenic area combines garden landscapes with viewpoints overlooking the surrounding mountains.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "name": "Shrubbery Nightingale Area"
  },
  {
    "id": "Siddheshwari Festival Ground_Siddheshwari",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Siddheshwari Festival Ground",
    "destinationId": "Siddheshwari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Area used for temple fairs and religious gatherings."
  },
  {
    "id": "Siddheshwari Temple Complex_Siddheshwari",
    "category": "Monastery",
    "gallery": [],
    "description": "Temple precinct containing shrines and spaces used for religious ceremonies.",
    "name": "Siddheshwari Temple Complex",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Siddheshwari"
  },
  {
    "id": "Siddheshwari Temple_Siddheshwari",
    "category": "Monastery",
    "gallery": [],
    "name": "Siddheshwari Temple",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Siddheshwari",
    "description": "Important regional temple attracting devotees throughout the year."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sikkim Border Corridor_Rongli",
    "destinationId": "Rongli",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sikkim Border Corridor",
    "description": "A tourism zone highlighting the transition between Kalimpong and East Sikkim landscapes."
  },
  {
    "gallery": [],
    "id": "Silent Valley View_Sillery Gaon",
    "category": "Viewpoint",
    "description": "A scenic viewpoint overlooking forested valleys and mountain ridges.",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Silent Valley View"
  },
  {
    "category": "Viewpoint",
    "id": "Silent Valley Viewpoint_Pedong",
    "gallery": [],
    "name": "Silent Valley Viewpoint",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A scenic viewpoint overlooking forests  valleys  and distant Himalayan ridges."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Singalila National Park Checkpost_Gairibas",
    "destinationId": "Gairibas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Singalila National Park Checkpost",
    "description": "A major checkpoint and entry zone within Singalila National Park."
  },
  {
    "category": "Viewpoint",
    "id": "Singalila National Park Entry Gate_Manebhanjan",
    "gallery": [],
    "name": "Singalila National Park Entry Gate",
    "destinationId": "Manebhanjan",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "The main gateway to Singalila National Park and the starting point for the famous Sandakphu trekking route."
  },
  {
    "description": "Scenic high-altitude trekking route along the Singalila Ridge with panoramic Himalayan vistas.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sandakphu",
    "name": "Singalila Ridge Walk",
    "gallery": [],
    "id": "Singalila Ridge Walk_Sandakphu",
    "category": "Trek"
  },
  {
    "description": "Important crossing over the Little Rangit River and a landmark of the Singla valley.",
    "name": "Singla Bridge Area",
    "destinationId": "Singla",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Singla Bridge Area_Singla",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Singla Riverside Zone_Singla",
    "category": "Viewpoint",
    "description": "Riverside area popular for photography and nature appreciation.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Singla",
    "name": "Singla Riverside Zone"
  },
  {
    "name": "Singla Village Cluster",
    "destinationId": "Singla",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Traditional hill villages offering local cultural experiences.",
    "id": "Singla Village Cluster_Singla",
    "category": "Village",
    "gallery": []
  },
  {
    "description": "Historic plantation bungalow associated with colonial tea history.",
    "name": "Singtom Heritage Tea Bungalow",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Singtom",
    "id": "Singtom Heritage Tea Bungalow_Singtom",
    "category": "Monastery",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Singtom Tea Estate_Singtom",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Singtom",
    "name": "Singtom Tea Estate",
    "description": "One of Darjeeling  s oldest tea estates with heritage value."
  },
  {
    "gallery": [],
    "id": "Sitai Village Cluster_Sitai",
    "category": "Village",
    "description": "Traditional villages showcasing local culture and agricultural landscapes.",
    "destinationId": "Sitai",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sitai Village Cluster"
  },
  {
    "id": "Sitai Wetland Area_Sitai",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Sitai Wetland Area",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sitai",
    "description": "Wetland ecosystem supporting seasonal birdlife and rural eco-tourism."
  },
  {
    "description": "Scenic viewpoints overlooking the Teesta Valley  forests  orchards  and surrounding hills.",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sittong Viewpoints",
    "gallery": [],
    "id": "Sittong Viewpoints_Sittong",
    "category": "Viewpoint"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tumling",
    "name": "Sleeping Buddha Panorama",
    "description": "Famous for the Sleeping Buddha formation created by the Kanchenjunga massif.",
    "gallery": [],
    "id": "Sleeping Buddha Panorama_Tumling",
    "category": "Viewpoint"
  },
  {
    "id": "Sleeping Buddha View_Sandakphu",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Sleeping Buddha View",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sandakphu",
    "description": "The world-famous view of the Sleeping Buddha mountain formation."
  },
  {
    "gallery": [],
    "id": "Sonada Route Section_Sonada",
    "category": "Viewpoint",
    "destinationId": "Sonada",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sonada Route Section",
    "description": "The Sonada section of the Darjeeling Himalayan Railway offers scenic mountain landscapes and classic toy train experiences."
  },
  {
    "description": "Soureni combines tea gardens and orange cultivation  creating a unique agro-tourism experience.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Soureni",
    "name": "Soureni Orange Region",
    "gallery": [],
    "id": "Soureni Orange Region_Soureni",
    "category": "Viewpoint"
  },
  {
    "description": "Soureni Tea Estate offers beautiful plantation scenery and authentic tea tourism experiences.",
    "name": "Soureni Tea Estate",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mirik",
    "id": "Soureni Tea Estate_Mirik",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "Soureni Tea Estate is a scenic plantation known for lush tea gardens  rolling hills  and authentic Darjeeling tea experiences.",
    "destinationId": "Soureni",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Soureni Tea Estate",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Soureni Tea Estate_Soureni"
  },
  {
    "name": "South Khayerbari Rescue Centre",
    "destinationId": "Madarihat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Wildlife rescue and rehabilitation centre known for leopard conservation.",
    "id": "South Khayerbari Rescue Centre_Madarihat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Srikhola",
    "name": "Srikhola Suspension Bridge",
    "description": "The iconic suspension bridge crossing the Srikhola River is one of the most photographed landmarks in the region.",
    "gallery": [],
    "id": "Srikhola Suspension Bridge_Srikhola",
    "category": "Viewpoint"
  },
  {
    "id": "St. Joseph  s Seminary (North Point)_North Point",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Historic educational and religious institution established during the colonial period.",
    "name": "St. Joseph  s Seminary (North Point)",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "North Point"
  },
  {
    "id": "St. Mary  s Hill_Kurseong",
    "category": "Monastery",
    "gallery": [],
    "description": "St. Mary  s Hill is known for its peaceful environment  colonial-era heritage  and panoramic views of the surrounding hills.",
    "name": "St. Mary  s Hill",
    "destinationId": "Kurseong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Steep Climb Section_Bikeybhanjang",
    "description": "The most challenging ascent on the route to Sandakphu  popular among trekkers.",
    "destinationId": "Bikeybhanjang",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Steep Climb Section"
  },
  {
    "name": "Sumendu Lake",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Sumendu Lake is the centerpiece of Mirik and one of the most beautiful lakes in North Bengal  offering boating  lakeside walks  and scenic Himalayan surroundings.",
    "id": "Sumendu Lake_Mirik",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Sunbird Observation Zones",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "description": "Flower-rich forest sections attracting colorful sunbird species.",
    "id": "Sunbird Observation Zones_Lepchajagat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sungma Tea Estate_Darjeeling",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sungma Tea Estate",
    "description": "Sungma Tea Estate is one of the oldest tea estates in Darjeeling  known for its heritage and premium tea production."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dawaipani",
    "name": "Sunrise Deck",
    "description": "A popular sunrise location offering spectacular Himalayan views and morning photography opportunities.",
    "gallery": [],
    "id": "Sunrise Deck_Dawaipani",
    "category": "Viewpoint"
  },
  {
    "name": "Sunrise Deck",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kafer",
    "description": "A popular location for sunrise viewing and mountain photography.",
    "id": "Sunrise Deck_Kafer",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Sunrise Photography Point_Lepchajagat",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Sunrise Photography Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "description": "A popular location for sunrise photography with clear Himalayan panoramas."
  },
  {
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Photography Points",
    "description": "Elevated viewpoints ideal for capturing sunrise over the Eastern Himalayas and Teesta Valley.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sunrise Photography Points_Peshok"
  },
  {
    "category": "Viewpoint",
    "id": "Sunrise Photography Points_Tinchuley",
    "gallery": [],
    "name": "Sunrise Photography Points",
    "destinationId": "Tinchuley",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Popular locations for capturing sunrise views over the Himalayan mountains."
  },
  {
    "description": "A popular location for witnessing sunrise over the Himalayas with changing colors across the mountain ranges.",
    "name": "Sunrise Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ahaldara",
    "id": "Sunrise Point_Ahaldara",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Sunrise Point_Charkhole",
    "category": "Viewpoint",
    "description": "A scenic sunrise location popular among photographers and nature lovers.",
    "destinationId": "Charkhole",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Point"
  },
  {
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Point",
    "description": "A scenic sunrise viewpoint offering beautiful views of the Himalayan foothills  valleys  and surrounding forests.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sunrise Point_Chuikhim"
  },
  {
    "description": "A popular viewpoint for witnessing sunrise over the Eastern Himalayas and surrounding valleys.",
    "destinationId": "Delo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Point",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sunrise Point_Delo"
  },
  {
    "name": "Sunrise Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalipokhri",
    "description": "A viewpoint known for beautiful Himalayan sunrise scenery.",
    "id": "Sunrise Point_Kalipokhri",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Sunrise Point_Lolegaon",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lolegaon",
    "name": "Sunrise Point",
    "description": "A scenic viewpoint known for spectacular sunrise views over the Himalayan landscape."
  },
  {
    "gallery": [],
    "id": "Sunrise Point_Rikisum",
    "category": "Viewpoint",
    "description": "A popular location for witnessing sunrise over the Eastern Himalayas and forest-covered valleys.",
    "destinationId": "Rikisum",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Point"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sandakphu",
    "name": "Sunrise Point",
    "description": "One of the best sunrise locations in the Eastern Himalayas.",
    "gallery": [],
    "id": "Sunrise Point_Sandakphu",
    "category": "Viewpoint"
  },
  {
    "name": "Sunrise Point",
    "destinationId": "Tumling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A popular location for sunrise views over the Eastern Himalayas.",
    "category": "Viewpoint",
    "id": "Sunrise Point_Tumling",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sunrise Points_Icchey Gaon",
    "description": "Elevated locations known for beautiful sunrise views over the Eastern Himalayas.",
    "destinationId": "Icchey Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Points"
  },
  {
    "destinationId": "Rohini",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Points",
    "description": "Several elevated locations in Rohini offer spectacular sunrise views over the foothills and distant Himalayan ridges.",
    "gallery": [],
    "id": "Sunrise Points_Rohini",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Phalut",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Ridge Point",
    "description": "Elevated viewpoint renowned for dramatic sunrise views over the Himalayan mountain range.",
    "gallery": [],
    "id": "Sunrise Ridge Point_Phalut",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Sunrise Ridge Point_Sillery Gaon",
    "category": "Viewpoint",
    "description": "A ridge-top location known for spectacular sunrise views over the Himalayas.",
    "destinationId": "Sillery Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunrise Ridge Point"
  },
  {
    "category": "Viewpoint",
    "id": "Sunset Photography Point_Delo",
    "gallery": [],
    "name": "Sunset Photography Point",
    "destinationId": "Delo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A popular location for capturing sunset landscapes and mountain silhouettes."
  },
  {
    "destinationId": "Ahaldara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunset Point",
    "description": "An elevated viewpoint known for dramatic sunset landscapes and panoramic valley views.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sunset Point_Ahaldara"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Sunset Point_Sandakphu",
    "destinationId": "Sandakphu",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunset Point",
    "description": "A spectacular location for sunset photography over Himalayan peaks."
  },
  {
    "id": "Sunset Points_Murti",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic locations offering spectacular sunset views over the river and surrounding forests.",
    "name": "Sunset Points",
    "destinationId": "Murti",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Sunset View Point_Rishop",
    "category": "Viewpoint",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Sunset View Point",
    "description": "A scenic location known for sunset photography and mountain panoramas."
  },
  {
    "id": "Suntalekhola Forest Belt_Suntalekhola",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Suntalekhola Forest Belt",
    "destinationId": "Suntalekhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest landscape adjoining Neora Valley National Park."
  },
  {
    "category": "Viewpoint",
    "id": "Suntalekhola Forest Trail_Suntalekhola",
    "gallery": [],
    "description": "Scenic walking route through forests rich in birds and butterflies.",
    "name": "Suntalekhola Forest Trail",
    "destinationId": "Suntalekhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Suntalekhola Hanging Bridge_Suntalekhola",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Suntalekhola",
    "name": "Suntalekhola Hanging Bridge",
    "description": "Iconic hanging bridge crossing the Suntalekhola stream."
  },
  {
    "name": "Suntalekhola Nature Camp",
    "destinationId": "Suntalekhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Government eco-tourism complex surrounded by forest and stream.",
    "category": "Viewpoint",
    "id": "Suntalekhola Nature Camp_Suntalekhola",
    "gallery": []
  },
  {
    "description": "Mountain stream flowing through dense forests and eco-tourism zones.",
    "name": "Suntalekhola Stream",
    "destinationId": "Suntalekhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Suntalekhola Stream_Suntalekhola",
    "gallery": []
  },
  {
    "id": "Suntalekhola_Samsing",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Popular forest and riverside destination known for hanging bridges  birdwatching and eco-tourism.",
    "name": "Suntalekhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Samsing"
  },
  {
    "description": "Scenic suspension bridges crossing rivers and valleys  offering excellent photography opportunities.",
    "destinationId": "Rammam",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Suspension Bridges",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Suspension Bridges_Rammam"
  },
  {
    "name": "Suspension Bridges",
    "destinationId": "Reshikhola",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic suspension bridges crossing the river and connecting nearby settlements.",
    "category": "Viewpoint",
    "id": "Suspension Bridges_Reshikhola",
    "gallery": []
  },
  {
    "id": "Tagore Heritage Trail_Mungpoo",
    "category": "Monastery",
    "gallery": [],
    "name": "Tagore Heritage Trail",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mungpoo",
    "description": "A heritage trail connecting locations associated with Rabindranath Tagore  s visits to Mungpoo."
  },
  {
    "description": "A memorial dedicated to Rabindranath Tagore  highlighting his connection with Mungpoo and the Darjeeling hills.",
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tagore Memorial",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tagore Memorial_Mungpoo"
  },
  {
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Takdah Cantonment Area",
    "description": "A historic British-era cantonment known for colonial architecture and scenic surroundings.",
    "gallery": [],
    "id": "Takdah Cantonment Area_Takdah",
    "category": "Viewpoint"
  },
  {
    "description": "A collection of plantation routes ideal for tea tourism and photography.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Takdah",
    "name": "Takdah Tea Trails",
    "gallery": [],
    "id": "Takdah Tea Trails_Takdah",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Takdah Viewpoints",
    "description": "Scenic viewpoints overlooking valleys  forests  tea gardens  and Himalayan landscapes.",
    "gallery": [],
    "id": "Takdah Viewpoints_Takdah",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tangta Forest Route_Tangta",
    "description": "Forest route connecting Tangta with nearby villages and birding areas.",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tangta Forest Route"
  },
  {
    "description": "Elevated ridge section offering panoramic views of the Jaldhaka Valley landscape.",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tangta Ridge View Area",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tangta Ridge View Area_Tangta"
  },
  {
    "name": "Tangta Valley",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "A picturesque valley surrounded by forests  hills  and traditional settlements.",
    "category": "Viewpoint",
    "id": "Tangta Valley_Tangta",
    "gallery": []
  },
  {
    "description": "Scenic observation point overlooking valleys  forests and surrounding hills.",
    "name": "Tangta Viewpoint",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Tangta Viewpoint_Tangta",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tangta Village",
    "description": "Remote Himalayan village in the Jaldhaka Valley region known for its peaceful rural setting and mountain scenery.",
    "gallery": [],
    "id": "Tangta Village_Tangta",
    "category": "Village"
  },
  {
    "gallery": [],
    "id": "Tea Estate Roads_Damdim",
    "category": "Viewpoint",
    "description": "Scenic roads passing through tea gardens and forest landscapes.",
    "destinationId": "Damdim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Estate Roads"
  },
  {
    "destinationId": "Makaibari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Estate Walking Trails",
    "description": "Scenic walking routes through tea gardens provide immersive plantation experiences and photography opportunities.",
    "gallery": [],
    "id": "Tea Estate Walking Trails_Makaibari",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Tea Estate Walks_Castleton",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Castleton",
    "name": "Tea Estate Walks",
    "description": "Plantation walking experiences showcasing tea cultivation and estate landscapes."
  },
  {
    "category": "Viewpoint",
    "id": "Tea Estate Walks_Mahaldiram",
    "gallery": [],
    "description": "Guided walks through tea plantations showcasing cultivation and local heritage.",
    "name": "Tea Estate Walks",
    "destinationId": "Mahaldiram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Tea Estates_Gayabari",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gayabari",
    "name": "Tea Estates",
    "description": "The surrounding tea estates provide scenic plantation landscapes and tea tourism opportunities."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Nagrakata",
    "name": "Tea Estates",
    "description": "One of the largest tea-growing regions in the Dooars  surrounded by numerous historic tea estates.",
    "gallery": [],
    "id": "Tea Estates_Nagrakata",
    "category": "Viewpoint"
  },
  {
    "description": "Opportunities to learn about tea processing  grading  and packaging.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Malbazar",
    "name": "Tea Factory Experience",
    "gallery": [],
    "id": "Tea Factory Experience_Malbazar",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tea Factory Tours_Makaibari",
    "description": "Visitors can observe tea processing techniques and learn about the journey from tea leaf to finished product.",
    "destinationId": "Makaibari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Factory Tours"
  },
  {
    "gallery": [],
    "id": "Tea Factory Visit Zones_Nagrakata",
    "category": "Viewpoint",
    "description": "Areas where visitors can observe tea production and processing activities.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Nagrakata",
    "name": "Tea Factory Visit Zones"
  },
  {
    "name": "Tea Factory Visits",
    "destinationId": "Soureni",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Visitors can observe the tea processing journey from fresh leaves to finished Darjeeling tea.",
    "id": "Tea Factory Visits_Soureni",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Tea Factory_Margaret  s Hope",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Tea Factory",
    "destinationId": "Margaret  s Hope",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Visitors can explore tea production processes and learn about the estate  s tea-making heritage."
  },
  {
    "description": "Vast stretches of Dooars tea gardens surrounding Malbazar  offering scenic views and tea-country experiences.",
    "name": "Tea Garden Landscapes",
    "destinationId": "Malbazar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Tea Garden Landscapes_Malbazar",
    "gallery": []
  },
  {
    "name": "Tea Garden Nature Walks",
    "destinationId": "Odlabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Walking trails through plantations showcasing tea cultivation and local landscapes.",
    "id": "Tea Garden Nature Walks_Odlabari",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Chalsa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Garden Photography Points",
    "description": "Scenic locations ideal for tea garden and landscape photography.",
    "gallery": [],
    "id": "Tea Garden Photography Points_Chalsa",
    "category": "Viewpoint"
  },
  {
    "name": "Tea Garden Sunrise Points",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Soureni",
    "description": "Elevated sections of the tea estate offer beautiful sunrise views over the hills and plantations.",
    "id": "Tea Garden Sunrise Points_Soureni",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Tea Garden Trails_Takdah",
    "category": "Viewpoint",
    "destinationId": "Takdah",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Garden Trails",
    "description": "Walking routes through tea estates providing authentic plantation experiences."
  },
  {
    "id": "Tea Garden Viewpoints_Mirik",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Tea Garden Viewpoints",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic locations overlooking tea plantations that showcase the classic beauty of the Darjeeling hills."
  },
  {
    "gallery": [],
    "id": "Tea Garden Walks_Soureni",
    "category": "Viewpoint",
    "destinationId": "Soureni",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Garden Walks",
    "description": "Guided and self-guided walks through tea plantations offer visitors insight into tea cultivation and local life."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tingling",
    "name": "Tea Garden Walks",
    "description": "Scenic walks through tea plantations provide beautiful views and authentic local experiences.",
    "gallery": [],
    "id": "Tea Garden Walks_Tingling",
    "category": "Viewpoint"
  },
  {
    "category": "Viewpoint",
    "id": "Tea Gardens_Ambotia",
    "gallery": [],
    "name": "Tea Gardens",
    "destinationId": "Ambotia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Expansive tea plantations provide a classic Darjeeling tea tourism experience."
  },
  {
    "gallery": [],
    "id": "Tea Gardens_Chalsa",
    "category": "Viewpoint",
    "description": "Expansive tea estates showcasing the tea-growing heritage of the Dooars region.",
    "destinationId": "Chalsa",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Gardens"
  },
  {
    "gallery": [],
    "id": "Tea Gardens_Mahaldiram",
    "category": "Viewpoint",
    "description": "Mahaldiram is known for scenic tea gardens spread across rolling hills and mountain slopes.",
    "destinationId": "Mahaldiram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Gardens"
  },
  {
    "gallery": [],
    "id": "Tea Gardens_Mateli",
    "category": "Viewpoint",
    "description": "Tea plantations surrounding the Matelli region.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mateli",
    "name": "Tea Gardens"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tea Gardens_Odlabari",
    "destinationId": "Odlabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Gardens",
    "description": "Extensive tea plantations forming part of the famous Dooars tea belt."
  },
  {
    "name": "Tea Gardens",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Rolling tea plantations surrounding Peshok create classic Darjeeling hill landscapes and tea tourism experiences.",
    "id": "Tea Gardens_Peshok",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Tea Processing Tours_Castleton",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Guided tours provide insight into traditional and modern tea manufacturing processes.",
    "name": "Tea Processing Tours",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Castleton"
  },
  {
    "id": "Tea Processing Tours_Gopaldhara",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Visitors can learn about tea production and the heritage of Darjeeling tea manufacturing.",
    "name": "Tea Processing Tours",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gopaldhara"
  },
  {
    "category": "Viewpoint",
    "id": "Tea Tasting Experience_Makaibari",
    "gallery": [],
    "description": "Guided tea tasting sessions allow visitors to explore the unique flavors and characteristics of premium Darjeeling tea.",
    "name": "Tea Tasting Experience",
    "destinationId": "Makaibari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tea Tasting Sessions_Margaret  s Hope",
    "destinationId": "Margaret  s Hope",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Tasting Sessions",
    "description": "Visitors can sample premium Darjeeling teas while learning about flavor profiles and tea grading."
  },
  {
    "description": "Walking trails through tea gardens allow visitors to experience plantation life and scenic mountain views.",
    "name": "Tea Trails",
    "destinationId": "Ambotia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Tea Trails_Ambotia",
    "gallery": []
  },
  {
    "destinationId": "Thurbo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Trails",
    "description": "Walking trails through tea gardens offer immersive experiences among plantations and mountain scenery.",
    "gallery": [],
    "id": "Tea Trails_Thurbo",
    "category": "Viewpoint"
  },
  {
    "description": "Settlements reflecting the history and culture of Dooars tea communities.",
    "name": "Tea Worker Heritage Villages",
    "destinationId": "Nagrakata",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Tea Worker Heritage Villages_Nagrakata",
    "gallery": []
  },
  {
    "destinationId": "Ambotia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tea Workers Heritage Trail",
    "description": "A cultural experience highlighting the traditions  lifestyle  and heritage of tea garden communities.",
    "gallery": [],
    "id": "Tea Workers Heritage Trail_Ambotia",
    "category": "Viewpoint"
  },
  {
    "id": "Teesta Access Routes_Odlabari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Gateway routes connecting travelers to the Teesta River and nearby river tourism destinations.",
    "name": "Teesta Access Routes",
    "destinationId": "Odlabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Teesta Barrage_Gajoldoba",
    "category": "Viewpoint",
    "description": "A major barrage on the Teesta River  serving as one of North Bengal  s most important riverfront tourism destinations.",
    "destinationId": "Gajoldoba",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta Barrage"
  },
  {
    "id": "Teesta Forest Edge_Mongpong",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Forest sections along the Teesta supporting rich biodiversity.",
    "name": "Teesta Forest Edge",
    "destinationId": "Mongpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Teesta River Observation Point_Peshok",
    "description": "A dedicated viewpoint offering clear views of the Teesta River and surrounding valleys.",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta River Observation Point"
  },
  {
    "description": "Scenic locations overlooking the Teesta River and surrounding valleys.",
    "name": "Teesta River View Areas",
    "destinationId": "Jogighat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Teesta River View Areas_Jogighat",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Teesta River Viewpoints_Mongpong",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Teesta River Viewpoints",
    "destinationId": "Mongpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic viewpoints overlooking the Teesta River as it enters the Dooars from the Himalayan foothills."
  },
  {
    "destinationId": "Mekhliganj",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta Riverbank View Area",
    "description": "Scenic Teesta river stretches near Mekhliganj offering river landscapes and photography opportunities.",
    "gallery": [],
    "id": "Teesta Riverbank View Area_Mekhliganj",
    "category": "Viewpoint"
  },
  {
    "description": "Scenic riverfront stretches ideal for sightseeing  photography  and relaxation.",
    "destinationId": "Gajoldoba",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta Riverfront",
    "gallery": [],
    "id": "Teesta Riverfront_Gajoldoba",
    "category": "Viewpoint"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Delo",
    "name": "Teesta Valley Panorama Point",
    "description": "A viewpoint overlooking the Teesta River and deep mountain valleys below.",
    "gallery": [],
    "id": "Teesta Valley Panorama Point_Delo",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Ramdhura",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta Valley Panorama",
    "description": "A panoramic viewpoint overlooking the Teesta River and deep valleys below.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Teesta Valley Panorama_Ramdhura"
  },
  {
    "id": "Teesta Valley View Area_Tinchuley",
    "category": "Viewpoint",
    "gallery": [],
    "description": "A scenic area overlooking the Teesta Valley  offering some of the finest landscape views near Tinchuley.",
    "name": "Teesta Valley View Area",
    "destinationId": "Tinchuley",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Teesta Valley View Areas_Munsong",
    "destinationId": "Munsong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta Valley View Areas",
    "description": "Select locations offering spectacular views of the Teesta Valley below."
  },
  {
    "description": "Scenic viewpoints overlooking the Teesta Valley and surrounding forested hills.",
    "name": "Teesta Valley View Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mungpoo",
    "id": "Teesta Valley View Corridor_Mungpoo",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "description": "A spectacular vantage point overlooking the Teesta River winding through deep valleys below.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Peshok",
    "name": "Teesta Valley View",
    "gallery": [],
    "id": "Teesta Valley View_Peshok",
    "category": "Viewpoint"
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ahaldara",
    "name": "Teesta Valley Views",
    "description": "Scenic overlooks offering breathtaking views of the Teesta River valley  forests  and mountain ridges.",
    "gallery": [],
    "id": "Teesta Valley Views_Ahaldara",
    "category": "Viewpoint"
  },
  {
    "description": "Panoramic views of the Teesta Valley and the hills of Sikkim from Durpin Hill.",
    "name": "Teesta Valley Views",
    "destinationId": "Durpin",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Teesta Valley Views_Durpin",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Teesta View Areas_Odlabari",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Odlabari",
    "name": "Teesta View Areas",
    "description": "Scenic viewpoints overlooking the Teesta River and surrounding foothills."
  },
  {
    "destinationId": "Gajoldoba",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta View Point",
    "description": "Scenic viewpoint overlooking the Teesta River  barrage  and surrounding landscapes.",
    "gallery": [],
    "id": "Teesta View Point_Gajoldoba",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Teesta View Point_Kalimpong",
    "category": "Viewpoint",
    "description": "A scenic location overlooking the Teesta River and surrounding valleys.",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta View Point"
  },
  {
    "name": "Teesta Viewpoints",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Sevoke Corridor",
    "description": "Multiple viewpoints offering panoramic views of the Teesta River gorge and surrounding hills.",
    "id": "Teesta Viewpoints_Sevoke Corridor",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "destinationId": "Sevoke Corridor",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Teesta-Rangit Confluence View Area",
    "description": "Scenic river viewpoints associated with the Teesta valley corridor.",
    "gallery": [],
    "id": "Teesta-Rangit Confluence View Area_Sevoke Corridor",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tharpa Choling Monastery",
    "description": "A historic Gelugpa Buddhist monastery known for its architecture and spiritual significance.",
    "gallery": [],
    "id": "Tharpa Choling Monastery_Kalimpong",
    "category": "Monastery"
  },
  {
    "description": "One of the oldest monasteries in Kalimpong  reflecting the region  s Buddhist heritage.",
    "name": "Thongsa Gompa",
    "destinationId": "Kalimpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Monastery",
    "id": "Thongsa Gompa_Kalimpong",
    "gallery": []
  },
  {
    "description": "A scenic tea estate area known for rolling plantations and panoramic hill views.",
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Thurbo Tea Estate View Area",
    "gallery": [],
    "id": "Thurbo Tea Estate View Area_Mirik",
    "category": "Viewpoint"
  },
  {
    "description": "Thurbo Tea Estate is one of the historic tea estates of Darjeeling  known for premium tea and scenic plantation landscapes.",
    "name": "Thurbo Tea Estate",
    "destinationId": "Thurbo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Thurbo Tea Estate_Thurbo",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling",
    "name": "Tibetan Refugee Self Help Centre",
    "description": "The centre showcases Tibetan handicrafts  culture  and community history while supporting local artisans.",
    "gallery": [],
    "id": "Tibetan Refugee Self Help Centre_Darjeeling",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "id": "Tiffindara Route_Rikisum",
    "category": "Viewpoint",
    "description": "A scenic route connecting Rikisum with nearby viewpoints through forests and mountain landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rikisum",
    "name": "Tiffindara Route"
  },
  {
    "description": "A famous sunrise viewpoint offering panoramic Himalayan and valley views.",
    "name": "Tiffindara Viewpoint",
    "destinationId": "Rishop",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Tiffindara Viewpoint_Rishop",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Tiger Hill Access Point_Ghum",
    "category": "Viewpoint",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ghum",
    "name": "Tiger Hill Access Point",
    "description": "Ghoom serves as the primary access hub for visitors traveling to Tiger Hill for sunrise viewing."
  },
  {
    "description": "Tiger Hill is the most famous sunrise viewpoint in Darjeeling  offering spectacular views of Kanchenjunga and  on clear days  Mount Everest and other Himalayan peaks.",
    "destinationId": "Darjeeling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tiger Hill",
    "gallery": [],
    "id": "Tiger Hill_Darjeeling",
    "category": "Viewpoint"
  },
  {
    "id": "Tinchuley View Point_Tinchuley",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Tinchuley View Point",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tinchuley",
    "description": "The main viewpoint of Tinchuley offering panoramic views of Kanchenjunga  valleys  and surrounding hills."
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tingling",
    "name": "Tingling Orange Orchards",
    "description": "Tingling is one of the prominent orange-growing regions near Mirik  offering beautiful orchard landscapes and seasonal fruit tourism experiences.",
    "gallery": [],
    "id": "Tingling Orange Orchards_Tingling",
    "category": "Viewpoint"
  },
  {
    "destinationId": "Mirik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tingling View Point",
    "description": "This scenic viewpoint overlooks tea estates  forests  and rolling hills around the Mirik region.",
    "gallery": [],
    "id": "Tingling View Point_Mirik",
    "category": "Viewpoint"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Tingling Viewpoint_Tingling",
    "description": "Tingling Viewpoint offers panoramic views of tea estates  valleys  and surrounding Himalayan landscapes.",
    "destinationId": "Tingling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Tingling Viewpoint"
  },
  {
    "id": "Todey Forest Route_Todey",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Todey Forest Route",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic forest route connecting remote villages of the Jaldhaka Valley."
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Todey Valley Viewpoint_Todey",
    "description": "Scenic viewpoint overlooking valleys  forests and Bhutan hills.",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Todey Valley Viewpoint"
  },
  {
    "description": "A remote Himalayan valley known for its pristine landscapes  forests  and peaceful atmosphere.",
    "name": "Todey Valley",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Todey Valley_Todey",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Todey Village_Todey",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Remote Himalayan village near the Bhutan border known for its scenery and isolation.",
    "name": "Todey Village",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Torsa River Area_Hasimara",
    "description": "Scenic river stretches near Hasimara connecting the Jaldapara landscape.",
    "destinationId": "Hasimara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Torsa River Area"
  },
  {
    "id": "Torsa River View Areas_Madarihat",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic river stretches bordering Jaldapara landscapes.",
    "name": "Torsa River View Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Madarihat"
  },
  {
    "id": "Toto Cultural Centre_Totopara",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Toto Cultural Centre",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Totopara",
    "description": "Community space showcasing Toto traditions  customs  language and heritage."
  },
  {
    "id": "Toto Traditional Settlement Zone_Totopara",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Area preserving traditional Toto houses and village lifestyle.",
    "name": "Toto Traditional Settlement Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Totopara"
  },
  {
    "description": "Traditional settlement of the Toto community located near the Bhutan border.",
    "destinationId": "Totopara",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Totopara Village",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Totopara Village_Totopara"
  },
  {
    "description": "A major service center connecting visitors to Gorumara  Chapramari  Samsing  and other Dooars destinations.",
    "name": "Tourism Services Hub",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Malbazar",
    "id": "Tourism Services Hub_Malbazar",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Ghum",
    "name": "Toy Train Photography Point",
    "description": "A popular location where visitors can photograph the iconic toy train against the backdrop of the Himalayas.",
    "gallery": [],
    "id": "Toy Train Photography Point_Ghum",
    "category": "Viewpoint"
  },
  {
    "id": "Toy Train Route Views_Gayabari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Gayabari offers excellent viewpoints overlooking the historic Darjeeling Himalayan Railway route.",
    "name": "Toy Train Route Views",
    "destinationId": "Gayabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Traditional Craft Workshop_Kushmandi",
    "description": "Demonstration area where visitors can observe and participate in mask-making activities.",
    "destinationId": "Kushmandi",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Traditional Craft Workshop"
  },
  {
    "description": "Authentic village stays offering local hospitality and cultural immersion.",
    "name": "Traditional Homestays",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gorkhey",
    "id": "Traditional Homestays_Gorkhey",
    "category": "Village",
    "gallery": []
  },
  {
    "id": "Trek Base Market_Rimbik",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Trek Base Market",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rimbik",
    "description": "Rimbik serves as a major trekking base with markets  accommodations  and services for trekkers."
  },
  {
    "gallery": [],
    "category": "Trek",
    "id": "Trek Registration Point_Manebhanjan",
    "destinationId": "Manebhanjan",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Trek Registration Point",
    "description": "Official registration point for trekkers entering Singalila National Park."
  },
  {
    "gallery": [],
    "id": "Trek Rest Point_Chitrey",
    "category": "Trek",
    "destinationId": "Chitrey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Trek Rest Point",
    "description": "A popular resting stop for trekkers heading towards Sandakphu."
  },
  {
    "description": "A resting zone for trekkers moving through the Singalila trail system.",
    "name": "Trek Rest Point",
    "destinationId": "Kaiyakatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Trek Rest Point_Kaiyakatta",
    "category": "Trek",
    "gallery": []
  },
  {
    "destinationId": "Sabargram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Trekker Rest Zone",
    "description": "Traditional resting area used by trekkers traversing the Sandakphu?Phalut trail.",
    "gallery": [],
    "id": "Trekker Rest Zone_Sabargram",
    "category": "Trek"
  },
  {
    "description": "An information hub providing guidance  route details  and trekking support services.",
    "name": "Trekking Information Centre",
    "destinationId": "Rimbik",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Trekking Information Centre_Rimbik",
    "category": "Trek",
    "gallery": []
  },
  {
    "destinationId": "Lepchajagat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Trekking Season",
    "description": "Pleasant weather and clear skies make autumn the preferred trekking season.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Trekking Season_Lepchajagat"
  },
  {
    "description": "Bagora serves as a base for nature walks and trekking trails through forests and ridgelines.",
    "destinationId": "Bagora",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Trekking Trails",
    "gallery": [],
    "id": "Trekking Trails_Bagora",
    "category": "Trek"
  },
  {
    "gallery": [],
    "id": "Tufanganj Riverfront_Tufanganj",
    "category": "Viewpoint",
    "description": "Scenic riverfront area associated with the Tufanganj region.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tufanganj",
    "name": "Tufanganj Riverfront"
  },
  {
    "description": "One of the finest viewpoints on the Sandakphu trail with wide Himalayan panoramas.",
    "name": "Tumling Viewpoint",
    "destinationId": "Tumling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Tumling Viewpoint_Tumling",
    "gallery": []
  },
  {
    "id": "Tung Railway Station_Darjeeling",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Tung is a picturesque hill station stop on the Darjeeling Himalayan Railway route  surrounded by forests and tea gardens.",
    "name": "Tung Railway Station",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Darjeeling"
  },
  {
    "description": "Upper Sittong offers panoramic mountain views  village experiences  and access to orchards and forest trails.",
    "name": "Upper Sittong",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Village",
    "id": "Upper Sittong_Sittong",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Valley Observation Deck_Algarah",
    "category": "Viewpoint",
    "description": "A panoramic viewpoint overlooking valleys and forested mountain ridges.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Algarah",
    "name": "Valley Observation Deck"
  },
  {
    "gallery": [],
    "id": "Valley Panoramas_Peshok",
    "category": "Viewpoint",
    "destinationId": "Peshok",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Valley Panoramas",
    "description": "Scenic locations providing wide-angle views of valleys  forests  rivers  and mountain ridges."
  },
  {
    "description": "A scenic location offering panoramic views of the Tangta Valley and surrounding hills.",
    "name": "Valley View Point",
    "destinationId": "Tangta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "category": "Viewpoint",
    "id": "Valley View Point_Tangta",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Valley Viewpoints_Gayabari",
    "description": "Elevated locations offering views of valleys  tea gardens  and surrounding hills.",
    "destinationId": "Gayabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Valley Viewpoints"
  },
  {
    "description": "Scenic viewpoints overlooking valleys  forests  and surrounding hills.",
    "destinationId": "Pabong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Viewpoints",
    "gallery": [],
    "id": "Viewpoints_Pabong",
    "category": "Viewpoint"
  },
  {
    "description": "Areas where visitors can experience local traditions  cuisine  and village life.",
    "name": "Village Cultural Experience Zone",
    "destinationId": "Lingsey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Village Cultural Experience Zone_Lingsey",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "id": "Village Cultural Experience Zone_Rongli",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Village Cultural Experience Zone",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rongli",
    "description": "Areas where visitors can experience local traditions  cuisine  and village life."
  },
  {
    "gallery": [],
    "id": "Village Cultural Experience Zones_Odlabari",
    "category": "Viewpoint",
    "destinationId": "Odlabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Cultural Experience Zones",
    "description": "Areas where visitors can engage with local traditions and village lifestyles."
  },
  {
    "category": "Viewpoint",
    "id": "Village Cultural Experiences_Sittong",
    "gallery": [],
    "name": "Village Cultural Experiences",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Opportunities to experience local traditions  festivals  cuisine  and rural Himalayan lifestyles."
  },
  {
    "id": "Village Culture_Chuikhim",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Opportunities to experience local traditions  cuisine  festivals  and rural Himalayan lifestyles.",
    "name": "Village Culture",
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "id": "Village Homestay Cluster_Ramdhura",
    "category": "Village",
    "description": "Traditional homestays providing authentic local hospitality and cultural experiences.",
    "destinationId": "Ramdhura",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Homestay Cluster"
  },
  {
    "id": "Village Nature Walks_Pabong",
    "category": "Village",
    "gallery": [],
    "description": "Walking routes connecting villages  forests  and scenic landscapes.",
    "name": "Village Nature Walks",
    "destinationId": "Pabong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Village",
    "id": "Village Nature Walks_Pedong",
    "description": "Walking routes through traditional villages  forests  and rural landscapes.",
    "destinationId": "Pedong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Nature Walks"
  },
  {
    "gallery": [],
    "id": "Village Nature Walks_Tangta",
    "category": "Village",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tangta",
    "name": "Village Nature Walks",
    "description": "Walking trails connecting villages  forests  and scenic landscapes."
  },
  {
    "id": "Village Photography Points_Chuikhim",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Scenic locations ideal for capturing village life and Himalayan landscapes.",
    "name": "Village Photography Points",
    "destinationId": "Chuikhim",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Village Photography Points",
    "destinationId": "Gorkhey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Scenic locations around Gorkhey village ideal for capturing traditional Himalayan landscapes and rural life.",
    "category": "Viewpoint",
    "id": "Village Photography Points_Gorkhey",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Village Photography Points_Icchey Gaon",
    "category": "Viewpoint",
    "destinationId": "Icchey Gaon",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Photography Points",
    "description": "Scenic locations ideal for capturing village life  forests  and mountain landscapes."
  },
  {
    "gallery": [],
    "id": "Village Photography Points_Jogighat",
    "category": "Viewpoint",
    "description": "Scenic spots ideal for capturing village life  riverscapes  and mountain scenery.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Jogighat",
    "name": "Village Photography Points"
  },
  {
    "gallery": [],
    "id": "Village Tourism_Jogighat",
    "category": "Village",
    "destinationId": "Jogighat",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Tourism",
    "description": "Visitors can experience traditional Himalayan village life  local culture  and rural hospitality."
  },
  {
    "id": "Village Tourism_Mahaldiram",
    "category": "Village",
    "gallery": [],
    "description": "Visitors can explore local traditions  rural lifestyles  and scenic mountain settlements.",
    "name": "Village Tourism",
    "destinationId": "Mahaldiram",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "gallery": [],
    "category": "Village",
    "id": "Village Tourism_Odlabari",
    "destinationId": "Odlabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Tourism",
    "description": "Traditional villages offering local culture  agriculture  and homestay experiences."
  },
  {
    "gallery": [],
    "id": "Village Tourism_Tingling",
    "category": "Village",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tingling",
    "name": "Village Tourism",
    "description": "Visitors can experience traditional Himalayan village life  local culture  and rural hospitality."
  },
  {
    "gallery": [],
    "id": "Village Trails_Charkhole",
    "category": "Village",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Charkhole",
    "name": "Village Trails",
    "description": "Walking routes through traditional mountain villages and surrounding landscapes."
  },
  {
    "gallery": [],
    "id": "Village Trails_Dawaipani",
    "category": "Village",
    "description": "Walking trails connecting village settlements  forests  and scenic viewpoints.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Dawaipani",
    "name": "Village Trails"
  },
  {
    "description": "Walking routes through traditional mountain villages and surrounding natural landscapes.",
    "name": "Village Trails",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Icchey Gaon",
    "id": "Village Trails_Icchey Gaon",
    "category": "Village",
    "gallery": []
  },
  {
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Tinchuley",
    "name": "Village Trails",
    "description": "Walking trails through traditional Himalayan villages offering cultural and nature experiences.",
    "gallery": [],
    "id": "Village Trails_Tinchuley",
    "category": "Village"
  },
  {
    "destinationId": "Chimney",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Viewpoints",
    "description": "Scenic viewpoints overlooking forests  villages  and surrounding mountain landscapes.",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Village Viewpoints_Chimney"
  },
  {
    "description": "Walking routes connecting villages  orchards  forests  and cultural landmarks.",
    "destinationId": "Sittong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Walking Trails",
    "gallery": [],
    "id": "Village Walking Trails_Sittong",
    "category": "Village"
  },
  {
    "description": "Walking routes through traditional villages showcasing local culture and rural lifestyles.",
    "name": "Village Walks",
    "destinationId": "Gitdubling",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "id": "Village Walks_Gitdubling",
    "category": "Village",
    "gallery": []
  },
  {
    "name": "Village Walks",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Meghma",
    "description": "Walking routes through one of the highest villages in the Darjeeling Himalayas.",
    "id": "Village Walks_Meghma",
    "category": "Village",
    "gallery": []
  },
  {
    "gallery": [],
    "category": "Village",
    "id": "Village Walks_Mungpoo",
    "destinationId": "Mungpoo",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Village Walks",
    "description": "Walking routes through traditional villages showcasing local culture and mountain lifestyles."
  },
  {
    "id": "Vintage Land Rover Stand_Manebhanjan",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Vintage Land Rover Stand",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Manebhanjan",
    "description": "Home to the iconic vintage Land Rovers that transport visitors along the rugged Sandakphu route."
  },
  {
    "name": "Watch Towers",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Elevated watchtowers offering opportunities to observe wildlife  grasslands  and forest landscapes.",
    "category": "Viewpoint",
    "id": "Watch Towers_Chapramari",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Waterfall Photography Point_Pabong",
    "category": "Viewpoint",
    "destinationId": "Pabong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Waterfall Photography Point",
    "description": "Dedicated photography locations around the waterfall and forest landscapes."
  },
  {
    "description": "Dedicated birdwatching area used during migratory bird season.",
    "name": "Wetland Bird Observation Deck",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Rasik Beel",
    "id": "Wetland Bird Observation Deck_Rasik Beel",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "name": "Wetland Birding Areas",
    "destinationId": "Gajoldoba",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Extensive wetlands attracting resident and migratory birds from across Asia during winter.",
    "id": "Wetland Birding Areas_Gajoldoba",
    "category": "Viewpoint",
    "gallery": []
  },
  {
    "gallery": [],
    "id": "Wetland Ecosystem_Namthing",
    "category": "Viewpoint",
    "description": "A fragile wetland environment supporting amphibians  birds  and diverse plant life.",
    "destinationId": "Namthing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Wetland Ecosystem"
  },
  {
    "gallery": [],
    "category": "Viewpoint",
    "id": "Wetland Interpretation Area_Namthing",
    "destinationId": "Namthing",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Wetland Interpretation Area",
    "description": "Educational area explaining the ecology  conservation  and importance of Namthing Pokhri."
  },
  {
    "gallery": [],
    "id": "Wetland Photography Zones_Gajoldoba",
    "category": "Viewpoint",
    "description": "Prime photography locations for birds  wetlands  sunrise  and river landscapes.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Gajoldoba",
    "name": "Wetland Photography Zones"
  },
  {
    "description": "Forest floors and meadows become colorful with seasonal wildflowers.",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Lepchajagat",
    "name": "Wildflower Season",
    "gallery": [],
    "id": "Wildflower Season_Lepchajagat",
    "category": "Viewpoint"
  },
  {
    "id": "Wildlife Observation Areas_Kaiyakatta",
    "category": "Viewpoint",
    "gallery": [],
    "name": "Wildlife Observation Areas",
    "destinationId": "Kaiyakatta",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Areas known for wildlife sightings and nature observation."
  },
  {
    "description": "Designated wildlife viewing locations around grasslands and waterholes.",
    "destinationId": "Khunia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Wildlife Observation Areas",
    "gallery": [],
    "id": "Wildlife Observation Areas_Khunia",
    "category": "Viewpoint"
  },
  {
    "id": "Wildlife Observation Areas_Mateli",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Forest-edge areas suitable for observing wildlife movement.",
    "name": "Wildlife Observation Areas",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Mateli"
  },
  {
    "description": "Natural observation areas for birds  elephants  deer  and other wildlife.",
    "destinationId": "Mongpong",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Wildlife Observation Areas",
    "gallery": [],
    "category": "Viewpoint",
    "id": "Wildlife Observation Areas_Mongpong"
  },
  {
    "id": "Wildlife Observation Areas_Paren",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Natural habitats suitable for observing birds  butterflies  and forest wildlife.",
    "name": "Wildlife Observation Areas",
    "destinationId": "Paren",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "description": "Forest habitats supporting birds  butterflies  and Himalayan wildlife.",
    "destinationId": "Todey",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Wildlife Observation Areas",
    "gallery": [],
    "id": "Wildlife Observation Areas_Todey",
    "category": "Viewpoint"
  },
  {
    "id": "Wildlife Observation Points_Batabari",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Locations used for spotting rhinoceros  elephants  deer  and birds.",
    "name": "Wildlife Observation Points",
    "destinationId": "Batabari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "name": "Wildlife Observation Points",
    "destinationId": "Kolakham",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Forest observation areas suitable for birdwatching and wildlife spotting.",
    "category": "Viewpoint",
    "id": "Wildlife Observation Points_Kolakham",
    "gallery": []
  },
  {
    "id": "Wildlife Observation Points_Latpanchar",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Designated locations for observing birds  mammals  and forest biodiversity.",
    "name": "Wildlife Observation Points",
    "destinationId": "Latpanchar",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
  },
  {
    "category": "Viewpoint",
    "id": "Wildlife Photography Deck_Khunia",
    "gallery": [],
    "name": "Wildlife Photography Deck",
    "destinationId": "Khunia",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "description": "Dedicated photography locations near wildlife habitats."
  },
  {
    "description": "Prime locations for wildlife and nature photography.",
    "destinationId": "Chapramari",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "name": "Wildlife Photography Zones",
    "gallery": [],
    "id": "Wildlife Photography Zones_Chapramari",
    "category": "Viewpoint"
  },
  {
    "id": "Wildlife Photography Zones_Murti",
    "category": "Viewpoint",
    "gallery": [],
    "description": "Locations suitable for photographing birds  elephants  and forest wildlife.",
    "name": "Wildlife Photography Zones",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Murti"
  },
  {
    "id": "Zang Dhok Palri Phodang Monastery_Kalimpong",
    "category": "Monastery",
    "gallery": [],
    "name": "Zang Dhok Palri Phodang Monastery",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "destinationId": "Kalimpong",
    "description": "One of Kalimpong  s most important Buddhist monasteries  housing rare scriptures and offering serene surroundings."
  }
];

export const initialHomestays: Homestay[] = [];

export const initialRoutes: Route[] = [
  {
    "toHubId": "Sonada",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE002",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 7,
    "fareMax": 50,
    "timeMin": 15,
    "fromHubId": "Ghum",
    "path": [
      "Ghum",
      "Sonada"
    ],
    "timeMax": 25
  },
  {
    "timeMin": 30,
    "timeMax": 45,
    "path": [
      "Sonada",
      "Kurseong"
    ],
    "fromHubId": "Sonada",
    "fareMax": 80,
    "distance": 9,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 40,
    "toHubId": "Kurseong",
    "id": "ROUTE003"
  },
  {
    "timeMin": 20,
    "fromHubId": "Kurseong",
    "path": [
      "Kurseong",
      "Rohini"
    ],
    "timeMax": 35,
    "distance": 18,
    "fareMax": 100,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Rohini",
    "fareMin": 50,
    "type": "Direct",
    "id": "ROUTE004"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE005",
    "fareMin": 30,
    "toHubId": "Makaibari",
    "type": "Direct",
    "path": [
      "Kurseong",
      "Makaibari"
    ],
    "fromHubId": "Kurseong",
    "timeMax": 20,
    "timeMin": 10,
    "distance": 11,
    "fareMax": 60
  },
  {
    "timeMax": 60,
    "path": [
      "Kurseong",
      "Bagora"
    ],
    "fromHubId": "Kurseong",
    "timeMin": 40,
    "fareMax": 0,
    "distance": 12,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE006",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Bagora"
  },
  {
    "type": "Direct",
    "toHubId": "Chimney",
    "fareMin": 0,
    "id": "ROUTE007",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 0,
    "distance": 8,
    "timeMin": 10,
    "timeMax": 20,
    "fromHubId": "Bagora",
    "path": [
      "Bagora",
      "Chimney"
    ]
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE008",
    "toHubId": "Sukhiapokhri",
    "fareMin": 60,
    "type": "Direct",
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Sukhiapokhri"
    ],
    "timeMax": 60,
    "timeMin": 40,
    "distance": 19,
    "fareMax": 120
  },
  {
    "type": "Direct",
    "toHubId": "Simana",
    "fareMin": 20,
    "id": "ROUTE009",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 40,
    "distance": 5,
    "timeMin": 10,
    "timeMax": 15,
    "fromHubId": "Sukhiapokhri",
    "path": [
      "Sukhiapokhri",
      "Simana"
    ]
  },
  {
    "type": "Direct",
    "fareMin": 30,
    "toHubId": "Mirik",
    "id": "ROUTE010",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 70,
    "distance": 23,
    "timeMin": 15,
    "timeMax": 25,
    "path": [
      "Simana",
      "Mirik"
    ],
    "fromHubId": "Simana"
  },
  {
    "distance": 7,
    "fareMax": 50,
    "fromHubId": "Mirik",
    "path": [
      "Mirik",
      "Soureni"
    ],
    "timeMax": 20,
    "timeMin": 10,
    "id": "ROUTE011",
    "toHubId": "Soureni",
    "fareMin": 20,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fromHubId": "Soureni",
    "path": [
      "Soureni",
      "Thurbo"
    ],
    "timeMax": 15,
    "timeMin": 10,
    "distance": 6,
    "fareMax": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE012",
    "toHubId": "Thurbo",
    "fareMin": 0,
    "type": "Direct"
  },
  {
    "timeMin": 10,
    "path": [
      "Thurbo",
      "Gopaldhara"
    ],
    "fromHubId": "Thurbo",
    "timeMax": 15,
    "distance": 4,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 0,
    "toHubId": "Gopaldhara",
    "type": "Direct",
    "id": "ROUTE013"
  },
  {
    "id": "ROUTE014",
    "toHubId": "Lamahatta",
    "fareMin": 80,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 23,
    "fareMax": 150,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Lamahatta"
    ],
    "timeMax": 70,
    "timeMin": 50
  },
  {
    "distance": 8,
    "fareMax": 60,
    "timeMin": 15,
    "path": [
      "Lamahatta",
      "Takdah"
    ],
    "fromHubId": "Lamahatta",
    "timeMax": 25,
    "toHubId": "Takdah",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE015",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE016",
    "fareMin": 20,
    "toHubId": "Tinchuley",
    "type": "Direct",
    "fromHubId": "Takdah",
    "path": [
      "Takdah",
      "Tinchuley"
    ],
    "timeMax": 20,
    "timeMin": 10,
    "distance": 5,
    "fareMax": 50
  },
  {
    "fareMax": 0,
    "distance": 14,
    "timeMax": 25,
    "fromHubId": "Tinchuley",
    "path": [
      "Tinchuley",
      "Peshok"
    ],
    "timeMin": 15,
    "id": "ROUTE017",
    "type": "Direct",
    "toHubId": "Peshok",
    "fareMin": 0,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "toHubId": "Mungpoo",
    "fareMin": 40,
    "type": "Direct",
    "id": "ROUTE018",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 12,
    "fareMax": 80,
    "timeMin": 25,
    "fromHubId": "Peshok",
    "path": [
      "Peshok",
      "Mungpoo"
    ],
    "timeMax": 40
  },
  {
    "id": "ROUTE019",
    "fareMin": 0,
    "toHubId": "Ahaldara",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 10,
    "fareMax": 0,
    "fromHubId": "Mungpoo",
    "path": [
      "Mungpoo",
      "Ahaldara"
    ],
    "timeMax": 25,
    "timeMin": 15
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Sittong",
    "fareMin": 0,
    "id": "ROUTE020",
    "timeMin": 15,
    "timeMax": 25,
    "fromHubId": "Ahaldara",
    "path": [
      "Ahaldara",
      "Sittong"
    ],
    "fareMax": 0,
    "distance": 11
  },
  {
    "timeMin": 30,
    "path": [
      "Sittong",
      "Latpanchar"
    ],
    "fromHubId": "Sittong",
    "timeMax": 45,
    "distance": 15,
    "fareMax": 60,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Latpanchar",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE021"
  },
  {
    "fareMax": 100,
    "distance": 18,
    "timeMax": 45,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Badamtam"
    ],
    "timeMin": 30,
    "id": "ROUTE022",
    "type": "Direct",
    "toHubId": "Badamtam",
    "fareMin": 50,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fareMax": 0,
    "distance": 7,
    "timeMax": 30,
    "fromHubId": "Badamtam",
    "path": [
      "Badamtam",
      "Poobong"
    ],
    "timeMin": 20,
    "id": "ROUTE023",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Poobong",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE024",
    "toHubId": "Singtom",
    "fareMin": 0,
    "type": "Direct",
    "fromHubId": "Poobong",
    "path": [
      "Poobong",
      "Singtom"
    ],
    "timeMax": 25,
    "timeMin": 15,
    "distance": 12,
    "fareMax": 0
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE025",
    "type": "Direct",
    "toHubId": "Arya",
    "fareMin": 0,
    "timeMax": 30,
    "fromHubId": "Singtom",
    "path": [
      "Singtom",
      "Arya"
    ],
    "timeMin": 20,
    "fareMax": 0,
    "distance": 10
  },
  {
    "id": "ROUTE026",
    "toHubId": "Rangbull",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 14,
    "fareMax": 60,
    "fromHubId": "Arya",
    "path": [
      "Arya",
      "Rangbull"
    ],
    "timeMax": 25,
    "timeMin": 15
  },
  {
    "timeMax": 90,
    "fromHubId": "Manebhanjan",
    "path": [
      "Manebhanjan",
      "Chitrey"
    ],
    "timeMin": 60,
    "fareMax": 0,
    "distance": 8,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE027",
    "type": "Direct",
    "toHubId": "Chitrey",
    "fareMin": 0
  },
  {
    "fareMax": 0,
    "distance": 9,
    "timeMax": 150,
    "fromHubId": "Chitrey",
    "path": [
      "Chitrey",
      "Meghma"
    ],
    "timeMin": 120,
    "id": "ROUTE028",
    "type": "Direct",
    "toHubId": "Meghma",
    "fareMin": 0,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 45,
    "path": [
      "Meghma",
      "Tumling"
    ],
    "fromHubId": "Meghma",
    "timeMax": 60,
    "distance": 11,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Tumling",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE029"
  },
  {
    "timeMin": 180,
    "fromHubId": "Tumling",
    "path": [
      "Tumling",
      "Gairibas"
    ],
    "timeMax": 220,
    "distance": 9,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Gairibas",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE030"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Kalipokhri",
    "fareMin": 0,
    "id": "ROUTE031",
    "timeMin": 120,
    "timeMax": 150,
    "fromHubId": "Gairibas",
    "path": [
      "Gairibas",
      "Kalipokhri"
    ],
    "fareMax": 0,
    "distance": 11
  },
  {
    "id": "ROUTE032",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Sandakphu",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 0,
    "distance": 7,
    "timeMax": 220,
    "fromHubId": "Kalipokhri",
    "path": [
      "Kalipokhri",
      "Sandakphu"
    ],
    "timeMin": 180
  },
  {
    "fareMax": 0,
    "distance": 21,
    "timeMin": 420,
    "timeMax": 540,
    "path": [
      "Sandakphu",
      "Phalut"
    ],
    "fromHubId": "Sandakphu",
    "type": "Direct",
    "toHubId": "Phalut",
    "fareMin": 0,
    "id": "ROUTE033",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Gorkhey",
    "id": "ROUTE034",
    "timeMin": 300,
    "timeMax": 400,
    "path": [
      "Phalut",
      "Gorkhey"
    ],
    "fromHubId": "Phalut",
    "fareMax": 0,
    "distance": 21
  },
  {
    "timeMin": 120,
    "timeMax": 150,
    "fromHubId": "Gorkhey",
    "path": [
      "Gorkhey",
      "Rammam"
    ],
    "fareMax": 0,
    "distance": 15,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Rammam",
    "fareMin": 0,
    "id": "ROUTE035"
  },
  {
    "timeMin": 120,
    "fromHubId": "Rammam",
    "path": [
      "Rammam",
      "Srikhola"
    ],
    "timeMax": 150,
    "distance": 15,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 0,
    "toHubId": "Srikhola",
    "type": "Direct",
    "id": "ROUTE036"
  },
  {
    "timeMin": 90,
    "fromHubId": "Srikhola",
    "path": [
      "Srikhola",
      "Rimbik"
    ],
    "timeMax": 130,
    "distance": 7,
    "fareMax": 150,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 50,
    "toHubId": "Rimbik",
    "type": "Direct",
    "id": "ROUTE037"
  },
  {
    "path": [
      "Kalimpong",
      "Delo"
    ],
    "fromHubId": "Kalimpong",
    "timeMax": 25,
    "timeMin": 15,
    "distance": 19,
    "fareMax": 50,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE038",
    "toHubId": "Delo",
    "fareMin": 20,
    "type": "Direct"
  },
  {
    "timeMin": 10,
    "timeMax": 20,
    "path": [
      "Kalimpong",
      "Durpin"
    ],
    "fromHubId": "Kalimpong",
    "fareMax": 40,
    "distance": 10,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Durpin",
    "id": "ROUTE039"
  },
  {
    "timeMin": 45,
    "timeMax": 60,
    "fromHubId": "Kalimpong",
    "path": [
      "Kalimpong",
      "Pedong"
    ],
    "fareMax": 150,
    "distance": 14,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 80,
    "toHubId": "Pedong",
    "id": "ROUTE040"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Algarah",
    "fareMin": 60,
    "id": "ROUTE041",
    "timeMin": 35,
    "timeMax": 50,
    "fromHubId": "Kalimpong",
    "path": [
      "Kalimpong",
      "Algarah"
    ],
    "fareMax": 120,
    "distance": 16
  },
  {
    "fareMin": 30,
    "toHubId": "Kafer",
    "type": "Direct",
    "id": "ROUTE042",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 12,
    "fareMax": 60,
    "timeMin": 20,
    "path": [
      "Algarah",
      "Kafer"
    ],
    "fromHubId": "Algarah",
    "timeMax": 30
  },
  {
    "fareMax": 80,
    "distance": 7,
    "timeMin": 20,
    "timeMax": 30,
    "path": [
      "Pedong",
      "Sillery Gaon"
    ],
    "fromHubId": "Pedong",
    "type": "Direct",
    "fareMin": 40,
    "toHubId": "Sillery Gaon",
    "id": "ROUTE043",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "distance": 10,
    "fareMax": 80,
    "fromHubId": "Pedong",
    "path": [
      "Pedong",
      "Ramdhura"
    ],
    "timeMax": 45,
    "timeMin": 30,
    "id": "ROUTE044",
    "toHubId": "Ramdhura",
    "fareMin": 40,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 8,
    "fareMax": 0,
    "fromHubId": "Ramdhura",
    "path": [
      "Ramdhura",
      "Icchey Gaon"
    ],
    "timeMax": 30,
    "timeMin": 20,
    "id": "ROUTE045",
    "toHubId": "Icchey Gaon",
    "fareMin": 0,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fareMax": 0,
    "distance": 14,
    "timeMin": 25,
    "timeMax": 35,
    "path": [
      "Icchey Gaon",
      "Rikisum"
    ],
    "fromHubId": "Icchey Gaon",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Rikisum",
    "id": "ROUTE046",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Pankhasari",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE047",
    "timeMin": 30,
    "fromHubId": "Rikisum",
    "path": [
      "Rikisum",
      "Pankhasari"
    ],
    "timeMax": 45,
    "distance": 11,
    "fareMax": 0
  },
  {
    "fareMax": 60,
    "distance": 5,
    "timeMax": 30,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Rishop"
    ],
    "timeMin": 20,
    "id": "ROUTE048",
    "type": "Direct",
    "toHubId": "Rishop",
    "fareMin": 30,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "id": "ROUTE049",
    "type": "Direct",
    "toHubId": "Kolakham",
    "fareMin": 40,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 80,
    "distance": 20,
    "timeMax": 45,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Kolakham"
    ],
    "timeMin": 30
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE050",
    "toHubId": "Lolegaon",
    "fareMin": 80,
    "type": "Direct",
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Lolegaon"
    ],
    "timeMax": 80,
    "timeMin": 60,
    "distance": 24,
    "fareMax": 150
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Charkhole",
    "fareMin": 40,
    "type": "Direct",
    "id": "ROUTE051",
    "timeMin": 30,
    "fromHubId": "Lolegaon",
    "path": [
      "Lolegaon",
      "Charkhole"
    ],
    "timeMax": 50,
    "distance": 9,
    "fareMax": 80
  },
  {
    "timeMax": 35,
    "fromHubId": "Charkhole",
    "path": [
      "Charkhole",
      "Kafer"
    ],
    "timeMin": 25,
    "fareMax": 0,
    "distance": 18,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE052",
    "type": "Direct",
    "toHubId": "Kafer",
    "fareMin": 0
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Bindu",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE053",
    "timeMin": 25,
    "path": [
      "Jhalong",
      "Bindu"
    ],
    "fromHubId": "Jhalong",
    "timeMax": 35,
    "distance": 6,
    "fareMax": 50
  },
  {
    "timeMax": 50,
    "path": [
      "Bindu",
      "Paren"
    ],
    "fromHubId": "Bindu",
    "timeMin": 35,
    "fareMax": 60,
    "distance": 14,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE054",
    "type": "Direct",
    "toHubId": "Paren",
    "fareMin": 30
  },
  {
    "timeMax": 35,
    "fromHubId": "Paren",
    "path": [
      "Paren",
      "Chuikhim"
    ],
    "timeMin": 25,
    "fareMax": 60,
    "distance": 12,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE055",
    "type": "Direct",
    "fareMin": 30,
    "toHubId": "Chuikhim"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE056",
    "type": "Direct",
    "toHubId": "Todey",
    "fareMin": 0,
    "timeMax": 60,
    "path": [
      "Chuikhim",
      "Todey"
    ],
    "fromHubId": "Chuikhim",
    "timeMin": 45,
    "fareMax": 0,
    "distance": 8
  },
  {
    "id": "ROUTE057",
    "toHubId": "Tangta",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 22,
    "fareMax": 60,
    "fromHubId": "Todey",
    "path": [
      "Todey",
      "Tangta"
    ],
    "timeMax": 30,
    "timeMin": 20
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE058",
    "type": "Direct",
    "toHubId": "Lingse",
    "fareMin": 60,
    "timeMax": 50,
    "path": [
      "Pedong",
      "Lingse"
    ],
    "fromHubId": "Pedong",
    "timeMin": 45,
    "fareMax": 120,
    "distance": 16
  },
  {
    "id": "ROUTE059",
    "fareMin": 0,
    "toHubId": "Reshi",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 13,
    "fareMax": 0,
    "path": [
      "Lingse",
      "Reshi"
    ],
    "fromHubId": "Lingse",
    "timeMax": 40,
    "timeMin": 25
  },
  {
    "fromHubId": "Reshi",
    "path": [
      "Reshi",
      "Mankhim"
    ],
    "timeMax": 30,
    "timeMin": 20,
    "distance": 11,
    "fareMax": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE060",
    "toHubId": "Mankhim",
    "fareMin": 0,
    "type": "Direct"
  },
  {
    "distance": 12,
    "fareMax": 0,
    "timeMin": 15,
    "fromHubId": "Mankhim",
    "path": [
      "Mankhim",
      "Lingtam"
    ],
    "timeMax": 25,
    "toHubId": "Lingtam",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE061",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "distance": 18,
    "fareMax": 0,
    "path": [
      "Lingtam",
      "Fikkalaygaon"
    ],
    "fromHubId": "Lingtam",
    "timeMax": 30,
    "timeMin": 20,
    "id": "ROUTE062",
    "toHubId": "Fikkalaygaon",
    "fareMin": 0,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 70,
    "fareMax": 250,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Kalimpong"
    ],
    "timeMax": 150,
    "timeMin": 120,
    "id": "ROUTE063",
    "fareMin": 150,
    "toHubId": "Kalimpong",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 30,
    "timeMax": 50,
    "fromHubId": "Peshok",
    "path": [
      "Peshok",
      "Reshi"
    ],
    "fareMax": 100,
    "distance": 18,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Reshi",
    "id": "ROUTE064"
  },
  {
    "type": "Direct",
    "toHubId": "Kalimpong",
    "fareMin": 80,
    "id": "ROUTE065",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 150,
    "distance": 16,
    "timeMin": 45,
    "timeMax": 60,
    "path": [
      "Tinchuley",
      "Kalimpong"
    ],
    "fromHubId": "Tinchuley"
  },
  {
    "fromHubId": "Mungpoo",
    "path": [
      "Mungpoo",
      "Kalimpong"
    ],
    "timeMax": 120,
    "timeMin": 90,
    "distance": 38,
    "fareMax": 180,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE066",
    "toHubId": "Kalimpong",
    "fareMin": 100,
    "type": "Direct"
  },
  {
    "distance": 32,
    "fareMax": 150,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Gorubathan"
    ],
    "timeMax": 80,
    "timeMin": 60,
    "id": "ROUTE067",
    "toHubId": "Gorubathan",
    "fareMin": 80,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Gorumara",
    "id": "ROUTE068",
    "timeMin": 10,
    "timeMax": 20,
    "path": [
      "Lataguri",
      "Gorumara"
    ],
    "fromHubId": "Lataguri",
    "fareMax": 40,
    "distance": 15
  },
  {
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Dhupjhora",
    "id": "ROUTE069",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 40,
    "distance": 8,
    "timeMin": 15,
    "timeMax": 25,
    "fromHubId": "Lataguri",
    "path": [
      "Lataguri",
      "Dhupjhora"
    ]
  },
  {
    "id": "ROUTE070",
    "fareMin": 20,
    "toHubId": "Batabari",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 12,
    "fareMax": 50,
    "path": [
      "Lataguri",
      "Batabari"
    ],
    "fromHubId": "Lataguri",
    "timeMax": 30,
    "timeMin": 20
  },
  {
    "distance": 10,
    "fareMax": 50,
    "fromHubId": "Lataguri",
    "path": [
      "Lataguri",
      "Khunia"
    ],
    "timeMax": 30,
    "timeMin": 20,
    "id": "ROUTE071",
    "toHubId": "Khunia",
    "fareMin": 20,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "type": "Direct",
    "toHubId": "Murti",
    "fareMin": 30,
    "id": "ROUTE072",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 60,
    "distance": 8,
    "timeMin": 20,
    "timeMax": 30,
    "fromHubId": "Lataguri",
    "path": [
      "Lataguri",
      "Murti"
    ]
  },
  {
    "distance": 9,
    "fareMax": 50,
    "timeMin": 15,
    "path": [
      "Murti",
      "Chalsa"
    ],
    "fromHubId": "Murti",
    "timeMax": 25,
    "toHubId": "Chalsa",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE073",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "fareMax": 40,
    "distance": 11,
    "timeMax": 25,
    "fromHubId": "Chalsa",
    "path": [
      "Chalsa",
      "Chapramari"
    ],
    "timeMin": 15,
    "id": "ROUTE074",
    "type": "Direct",
    "toHubId": "Chapramari",
    "fareMin": 20,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fromHubId": "Chapramari",
    "path": [
      "Chapramari",
      "Nagrakata"
    ],
    "timeMax": 50,
    "timeMin": 35,
    "distance": 14,
    "fareMax": 60,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE075",
    "fareMin": 30,
    "toHubId": "Nagrakata",
    "type": "Direct"
  },
  {
    "timeMax": 40,
    "fromHubId": "Nagrakata",
    "path": [
      "Nagrakata",
      "Malbazar"
    ],
    "timeMin": 25,
    "fareMax": 50,
    "distance": 17,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE076",
    "type": "Direct",
    "toHubId": "Malbazar",
    "fareMin": 20
  },
  {
    "fareMax": 40,
    "distance": 16,
    "timeMin": 20,
    "timeMax": 30,
    "fromHubId": "Malbazar",
    "path": [
      "Malbazar",
      "Odlabari"
    ],
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Odlabari",
    "id": "ROUTE077",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMax": 25,
    "fromHubId": "Odlabari",
    "path": [
      "Odlabari",
      "Damdim"
    ],
    "timeMin": 15,
    "fareMax": 40,
    "distance": 12,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE078",
    "type": "Direct",
    "toHubId": "Damdim",
    "fareMin": 20
  },
  {
    "fromHubId": "Damdim",
    "path": [
      "Damdim",
      "Bagrakote"
    ],
    "timeMax": 30,
    "timeMin": 20,
    "distance": 18,
    "fareMax": 50,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE079",
    "fareMin": 20,
    "toHubId": "Bagrakote",
    "type": "Direct"
  },
  {
    "fromHubId": "Bagrakote",
    "path": [
      "Bagrakote",
      "Chalsa"
    ],
    "timeMax": 40,
    "timeMin": 25,
    "distance": 15,
    "fareMax": 50,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE080",
    "toHubId": "Chalsa",
    "fareMin": 20,
    "type": "Direct"
  },
  {
    "distance": 35,
    "fareMax": 60,
    "timeMin": 25,
    "fromHubId": "Odlabari",
    "path": [
      "Odlabari",
      "Mongpong"
    ],
    "timeMax": 40,
    "toHubId": "Mongpong",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE081",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMin": 20,
    "timeMax": 30,
    "fromHubId": "Mongpong",
    "path": [
      "Mongpong",
      "Sevoke Corridor"
    ],
    "fareMax": 60,
    "distance": 12,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Sevoke Corridor",
    "fareMin": 30,
    "id": "ROUTE082"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Gajoldoba",
    "fareMin": 50,
    "id": "ROUTE083",
    "timeMin": 45,
    "timeMax": 60,
    "fromHubId": "Sevoke Corridor",
    "path": [
      "Sevoke Corridor",
      "Gajoldoba"
    ],
    "fareMax": 100,
    "distance": 32
  },
  {
    "distance": 15,
    "fareMax": 80,
    "fromHubId": "Gajoldoba",
    "path": [
      "Gajoldoba",
      "Mainaguri"
    ],
    "timeMax": 50,
    "timeMin": 35,
    "id": "ROUTE084",
    "toHubId": "Mainaguri",
    "fareMin": 40,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 30,
    "fromHubId": "Mainaguri",
    "path": [
      "Mainaguri",
      "Dhupguri"
    ],
    "timeMax": 50,
    "distance": 18,
    "fareMax": 50,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Dhupguri",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE085"
  },
  {
    "timeMin": 20,
    "timeMax": 30,
    "fromHubId": "Dhupguri",
    "path": [
      "Dhupguri",
      "Kranti"
    ],
    "fareMax": 50,
    "distance": 14,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Kranti",
    "fareMin": 20,
    "id": "ROUTE086"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE087",
    "toHubId": "Odlabari",
    "fareMin": 80,
    "type": "Direct",
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Odlabari"
    ],
    "timeMax": 80,
    "timeMin": 60,
    "distance": 32,
    "fareMax": 150
  },
  {
    "id": "ROUTE088",
    "toHubId": "Gajoldoba",
    "fareMin": 150,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 78,
    "fareMax": 250,
    "fromHubId": "Kalimpong",
    "path": [
      "Kalimpong",
      "Gajoldoba"
    ],
    "timeMax": 160,
    "timeMin": 120
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 50,
    "toHubId": "Samsing",
    "type": "Direct",
    "id": "ROUTE089",
    "timeMin": 30,
    "fromHubId": "Murti",
    "path": [
      "Murti",
      "Samsing"
    ],
    "timeMax": 50,
    "distance": 18,
    "fareMax": 100
  },
  {
    "timeMin": 25,
    "fromHubId": "Chalsa",
    "path": [
      "Chalsa",
      "Samsing"
    ],
    "timeMax": 40,
    "distance": 24,
    "fareMax": 60,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Samsing",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE090"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE091",
    "type": "Direct",
    "fareMin": 100,
    "toHubId": "Jhalong",
    "timeMax": 120,
    "path": [
      "Lataguri",
      "Jhalong"
    ],
    "fromHubId": "Lataguri",
    "timeMin": 90,
    "fareMax": 180,
    "distance": 38
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE092",
    "fareMin": 350,
    "toHubId": "Hollong",
    "type": "Direct",
    "fromHubId": "Madarihat",
    "path": [
      "Madarihat",
      "Hollong"
    ],
    "timeMax": 40,
    "timeMin": 25,
    "distance": 20,
    "fareMax": 0
  },
  {
    "timeMax": 30,
    "path": [
      "Madarihat",
      "Chekamari"
    ],
    "fromHubId": "Madarihat",
    "timeMin": 15,
    "fareMax": 60,
    "distance": 16,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE093",
    "type": "Direct",
    "toHubId": "Chekamari",
    "fareMin": 30
  },
  {
    "timeMin": 20,
    "fromHubId": "Madarihat",
    "path": [
      "Madarihat",
      "Hasimara"
    ],
    "timeMax": 30,
    "distance": 28,
    "fareMax": 50,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 20,
    "toHubId": "Hasimara",
    "type": "Direct",
    "id": "ROUTE094"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE095",
    "type": "Direct",
    "toHubId": "Jaldapara Gate",
    "fareMin": 20,
    "timeMax": 30,
    "fromHubId": "Hasimara",
    "path": [
      "Hasimara",
      "Jaldapara Gate"
    ],
    "timeMin": 20,
    "fareMax": 50,
    "distance": 7
  },
  {
    "timeMin": 35,
    "path": [
      "Hasimara",
      "Chilapata"
    ],
    "fromHubId": "Hasimara",
    "timeMax": 50,
    "distance": 12,
    "fareMax": 80,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Chilapata",
    "fareMin": 40,
    "type": "Direct",
    "id": "ROUTE096"
  },
  {
    "path": [
      "Chilapata",
      "Kodalbasti"
    ],
    "fromHubId": "Chilapata",
    "timeMax": 30,
    "timeMin": 15,
    "distance": 10,
    "fareMax": 50,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE097",
    "toHubId": "Kodalbasti",
    "fareMin": 20,
    "type": "Direct"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE098",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Nalraja Garh",
    "timeMax": 30,
    "path": [
      "Kodalbasti",
      "Nalraja Garh"
    ],
    "fromHubId": "Kodalbasti",
    "timeMin": 15,
    "fareMax": 0,
    "distance": 18
  },
  {
    "fareMax": 80,
    "distance": 22,
    "timeMax": 50,
    "fromHubId": "Chilapata",
    "path": [
      "Chilapata",
      "Alipurduar"
    ],
    "timeMin": 35,
    "id": "ROUTE099",
    "type": "Direct",
    "toHubId": "Alipurduar",
    "fareMin": 40,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 25,
    "fromHubId": "Alipurduar",
    "path": [
      "Alipurduar",
      "Rajabhatkhawa"
    ],
    "timeMax": 40,
    "distance": 24,
    "fareMax": 60,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Rajabhatkhawa",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE100"
  },
  {
    "timeMin": 25,
    "timeMax": 40,
    "path": [
      "Rajabhatkhawa",
      "Santalabari"
    ],
    "fromHubId": "Rajabhatkhawa",
    "fareMax": 60,
    "distance": 14,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Santalabari",
    "fareMin": 30,
    "id": "ROUTE101"
  },
  {
    "toHubId": "Buxa Fort",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE102",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 5,
    "fareMax": 0,
    "timeMin": 120,
    "fromHubId": "Santalabari",
    "path": [
      "Santalabari",
      "Buxa Fort"
    ],
    "timeMax": 180
  },
  {
    "id": "ROUTE103",
    "type": "Direct",
    "toHubId": "Lepchakha",
    "fareMin": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 0,
    "distance": 12,
    "timeMax": 120,
    "fromHubId": "Buxa Fort",
    "path": [
      "Buxa Fort",
      "Lepchakha"
    ],
    "timeMin": 90
  },
  {
    "timeMin": 30,
    "fromHubId": "Rajabhatkhawa",
    "path": [
      "Rajabhatkhawa",
      "Jayanti"
    ],
    "timeMax": 50,
    "distance": 15,
    "fareMax": 80,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Jayanti",
    "fareMin": 40,
    "type": "Direct",
    "id": "ROUTE104"
  },
  {
    "timeMin": 120,
    "fromHubId": "Jayanti",
    "path": [
      "Jayanti",
      "Mahakal Cave"
    ],
    "timeMax": 150,
    "distance": 6,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Mahakal Cave",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE105"
  },
  {
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Buxa Fort",
    "id": "ROUTE106",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 0,
    "distance": 13,
    "timeMin": 300,
    "timeMax": 400,
    "fromHubId": "Jayanti",
    "path": [
      "Jayanti",
      "Buxa Fort"
    ]
  },
  {
    "id": "ROUTE107",
    "type": "Direct",
    "toHubId": "Lepchakha",
    "fareMin": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 0,
    "distance": 21,
    "timeMax": 300,
    "fromHubId": "Jayanti",
    "path": [
      "Jayanti",
      "Lepchakha"
    ],
    "timeMin": 240
  },
  {
    "timeMin": 45,
    "path": [
      "Madarihat",
      "Totopara"
    ],
    "fromHubId": "Madarihat",
    "timeMax": 60,
    "distance": 16,
    "fareMax": 100,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Totopara",
    "fareMin": 50,
    "type": "Direct",
    "id": "ROUTE108"
  },
  {
    "toHubId": "Torsa River Belt",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE109",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 18,
    "fareMax": 0,
    "timeMin": 15,
    "fromHubId": "Totopara",
    "path": [
      "Totopara",
      "Torsa River Belt"
    ],
    "timeMax": 25
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Bhutan View Areas",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE110",
    "timeMin": 10,
    "fromHubId": "Totopara",
    "path": [
      "Totopara",
      "Bhutan View Areas"
    ],
    "timeMax": 20,
    "distance": 12,
    "fareMax": 0
  },
  {
    "fromHubId": "Jayanti",
    "path": [
      "Jayanti",
      "Raidak River Belt"
    ],
    "timeMax": 40,
    "timeMin": 25,
    "distance": 22,
    "fareMax": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE111",
    "toHubId": "Raidak River Belt",
    "fareMin": 0,
    "type": "Direct"
  },
  {
    "distance": 18,
    "fareMax": 0,
    "fromHubId": "Raidak Belt",
    "path": [
      "Raidak Belt",
      "Kaljani Belt"
    ],
    "timeMax": 50,
    "timeMin": 30,
    "id": "ROUTE112",
    "fareMin": 0,
    "toHubId": "Kaljani Belt",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 35,
    "path": [
      "Kaljani Belt",
      "Kumargram"
    ],
    "fromHubId": "Kaljani Belt",
    "timeMax": 50,
    "distance": 28,
    "fareMax": 80,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 40,
    "toHubId": "Kumargram",
    "type": "Direct",
    "id": "ROUTE113"
  },
  {
    "fareMax": 150,
    "distance": 35,
    "timeMax": 80,
    "fromHubId": "Chalsa",
    "path": [
      "Chalsa",
      "Madarihat"
    ],
    "timeMin": 60,
    "id": "ROUTE114",
    "type": "Direct",
    "fareMin": 80,
    "toHubId": "Madarihat",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 100,
    "toHubId": "Madarihat",
    "id": "ROUTE115",
    "timeMin": 90,
    "timeMax": 130,
    "fromHubId": "Lataguri",
    "path": [
      "Lataguri",
      "Madarihat"
    ],
    "fareMax": 180,
    "distance": 42
  },
  {
    "distance": 30,
    "fareMax": 180,
    "timeMin": 90,
    "fromHubId": "Murti",
    "path": [
      "Murti",
      "Hasimara"
    ],
    "timeMax": 130,
    "toHubId": "Hasimara",
    "fareMin": 100,
    "type": "Direct",
    "id": "ROUTE116",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 120,
    "toHubId": "Hasimara",
    "id": "ROUTE117",
    "timeMin": 120,
    "timeMax": 150,
    "path": [
      "Samsing",
      "Hasimara"
    ],
    "fromHubId": "Samsing",
    "fareMax": 200,
    "distance": 48
  },
  {
    "timeMax": 10,
    "fromHubId": "Cooch Behar",
    "path": [
      "Cooch Behar",
      "Madan Mohan Temple"
    ],
    "timeMin": 5,
    "fareMax": 0,
    "distance": 26,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE118",
    "type": "Direct",
    "toHubId": "Madan Mohan Temple",
    "fareMin": 0
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 0,
    "toHubId": "Sagar Dighi",
    "type": "Direct",
    "id": "ROUTE119",
    "timeMin": 5,
    "fromHubId": "Cooch Behar",
    "path": [
      "Cooch Behar",
      "Sagar Dighi"
    ],
    "timeMax": 10,
    "distance": 5,
    "fareMax": 0
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE120",
    "fareMin": 0,
    "toHubId": "Debibari",
    "type": "Direct",
    "path": [
      "Cooch Behar",
      "Debibari"
    ],
    "fromHubId": "Cooch Behar",
    "timeMax": 20,
    "timeMin": 10,
    "distance": 6,
    "fareMax": 0
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 20,
    "toHubId": "Baneswar",
    "type": "Direct",
    "id": "ROUTE121",
    "timeMin": 20,
    "fromHubId": "Cooch Behar",
    "path": [
      "Cooch Behar",
      "Baneswar"
    ],
    "timeMax": 30,
    "distance": 7,
    "fareMax": 40
  },
  {
    "type": "Direct",
    "toHubId": "Haripur",
    "fareMin": 20,
    "id": "ROUTE122",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 40,
    "distance": 12,
    "timeMin": 15,
    "timeMax": 25,
    "fromHubId": "Baneswar",
    "path": [
      "Baneswar",
      "Haripur"
    ]
  },
  {
    "id": "ROUTE123",
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Dinhata",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 50,
    "distance": 18,
    "timeMax": 45,
    "path": [
      "Haripur",
      "Dinhata"
    ],
    "fromHubId": "Haripur",
    "timeMin": 30
  },
  {
    "toHubId": "Rasik Beel",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE124",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 10,
    "fareMax": 60,
    "timeMin": 20,
    "fromHubId": "Tufanganj",
    "path": [
      "Tufanganj",
      "Rasik Beel"
    ],
    "timeMax": 30
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Sitalkuchi",
    "fareMin": 40,
    "id": "ROUTE125",
    "timeMin": 30,
    "timeMax": 50,
    "path": [
      "Rasik Beel",
      "Sitalkuchi"
    ],
    "fromHubId": "Rasik Beel",
    "fareMax": 80,
    "distance": 22
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE126",
    "toHubId": "Dinhata",
    "fareMin": 30,
    "type": "Direct",
    "fromHubId": "Sitalkuchi",
    "path": [
      "Sitalkuchi",
      "Dinhata"
    ],
    "timeMax": 50,
    "timeMin": 35,
    "distance": 14,
    "fareMax": 60
  },
  {
    "toHubId": "Changrabandha",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE127",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 20,
    "fareMax": 50,
    "timeMin": 20,
    "path": [
      "Mekhliganj",
      "Changrabandha"
    ],
    "fromHubId": "Mekhliganj",
    "timeMax": 30
  },
  {
    "distance": 16,
    "fareMax": 80,
    "fromHubId": "Changrabandha",
    "path": [
      "Changrabandha",
      "Sitalkuchi"
    ],
    "timeMax": 60,
    "timeMin": 40,
    "id": "ROUTE128",
    "toHubId": "Sitalkuchi",
    "fareMin": 40,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fareMax": 40,
    "distance": 12,
    "timeMin": 10,
    "timeMax": 20,
    "fromHubId": "Cooch Behar",
    "path": [
      "Cooch Behar",
      "Torsa River Belt"
    ],
    "type": "Direct",
    "toHubId": "Torsa River Belt",
    "fareMin": 20,
    "id": "ROUTE129",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "id": "ROUTE130",
    "type": "Direct",
    "toHubId": "Kaljani Belt",
    "fareMin": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 0,
    "distance": 18,
    "timeMax": 40,
    "fromHubId": "Torsa Belt",
    "path": [
      "Torsa Belt",
      "Kaljani Belt"
    ],
    "timeMin": 25
  },
  {
    "toHubId": "Raidak Belt",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE131",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 22,
    "fareMax": 0,
    "timeMin": 30,
    "fromHubId": "Kaljani Belt",
    "path": [
      "Kaljani Belt",
      "Raidak Belt"
    ],
    "timeMax": 50
  },
  {
    "timeMax": 60,
    "fromHubId": "Cooch Behar",
    "path": [
      "Cooch Behar",
      "Dinhata"
    ],
    "timeMin": 40,
    "fareMax": 80,
    "distance": 17,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE132",
    "type": "Direct",
    "fareMin": 40,
    "toHubId": "Dinhata"
  },
  {
    "timeMin": 45,
    "fromHubId": "Dinhata",
    "path": [
      "Dinhata",
      "Tufanganj"
    ],
    "timeMax": 60,
    "distance": 23,
    "fareMax": 80,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 40,
    "toHubId": "Tufanganj",
    "type": "Direct",
    "id": "ROUTE133"
  },
  {
    "type": "Direct",
    "fareMin": 40,
    "toHubId": "Mathabhanga",
    "id": "ROUTE134",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 80,
    "distance": 28,
    "timeMin": 35,
    "timeMax": 50,
    "fromHubId": "Tufanganj",
    "path": [
      "Tufanganj",
      "Mathabhanga"
    ]
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Mekhliganj",
    "fareMin": 50,
    "id": "ROUTE135",
    "timeMin": 50,
    "timeMax": 60,
    "fromHubId": "Mathabhanga",
    "path": [
      "Mathabhanga",
      "Mekhliganj"
    ],
    "fareMax": 100,
    "distance": 32
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE136",
    "type": "Direct",
    "toHubId": "Patiram",
    "fareMin": 20,
    "timeMax": 30,
    "path": [
      "Balurghat",
      "Patiram"
    ],
    "fromHubId": "Balurghat",
    "timeMin": 20,
    "fareMax": 40,
    "distance": 10
  },
  {
    "fareMax": 40,
    "distance": 8,
    "timeMin": 15,
    "timeMax": 30,
    "fromHubId": "Patiram",
    "path": [
      "Patiram",
      "Bolla"
    ],
    "type": "Direct",
    "toHubId": "Bolla",
    "fareMin": 20,
    "id": "ROUTE137",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "type": "Direct",
    "toHubId": "Gangarampur",
    "fareMin": 30,
    "id": "ROUTE138",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 60,
    "distance": 15,
    "timeMin": 40,
    "timeMax": 60,
    "path": [
      "Bolla",
      "Gangarampur"
    ],
    "fromHubId": "Bolla"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE139",
    "type": "Direct",
    "toHubId": "Kushmandi",
    "fareMin": 50,
    "timeMax": 90,
    "fromHubId": "Balurghat",
    "path": [
      "Balurghat",
      "Kushmandi"
    ],
    "timeMin": 60,
    "fareMax": 100,
    "distance": 27
  },
  {
    "distance": 12,
    "fareMax": 40,
    "path": [
      "Kushmandi",
      "Wooden Mask Villages"
    ],
    "fromHubId": "Kushmandi",
    "timeMax": 30,
    "timeMin": 15,
    "id": "ROUTE140",
    "toHubId": "Wooden Mask Villages",
    "fareMin": 20,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 30,
    "toHubId": "Gangarampur",
    "id": "ROUTE141",
    "timeMin": 35,
    "timeMax": 50,
    "fromHubId": "Wooden Mask Villages",
    "path": [
      "Wooden Mask Villages",
      "Gangarampur"
    ],
    "fareMax": 60,
    "distance": 14
  },
  {
    "fareMax": 60,
    "distance": 25,
    "timeMin": 35,
    "timeMax": 50,
    "fromHubId": "Balurghat",
    "path": [
      "Balurghat",
      "Hili"
    ],
    "type": "Direct",
    "toHubId": "Hili",
    "fareMin": 30,
    "id": "ROUTE142",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMin": 10,
    "fromHubId": "Hili",
    "path": [
      "Hili",
      "Border View Areas"
    ],
    "timeMax": 20,
    "distance": 6,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Border View Areas",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE143"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Atrai River Belt",
    "fareMin": 20,
    "id": "ROUTE144",
    "timeMin": 10,
    "timeMax": 20,
    "fromHubId": "Balurghat",
    "path": [
      "Balurghat",
      "Atrai River Belt"
    ],
    "fareMax": 40,
    "distance": 11
  },
  {
    "timeMin": 30,
    "timeMax": 40,
    "fromHubId": "Atrai Belt",
    "path": [
      "Atrai Belt",
      "Punarbhaba Belt"
    ],
    "fareMax": 0,
    "distance": 14,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Punarbhaba Belt",
    "fareMin": 0,
    "id": "ROUTE145"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE146",
    "toHubId": "Tangon Belt",
    "fareMin": 0,
    "type": "Direct",
    "path": [
      "Punarbhaba Belt",
      "Tangon Belt"
    ],
    "fromHubId": "Punarbhaba Belt",
    "timeMax": 50,
    "timeMin": 35,
    "distance": 18,
    "fareMax": 0
  },
  {
    "path": [
      "Balurghat",
      "Gangarampur"
    ],
    "fromHubId": "Balurghat",
    "timeMax": 80,
    "timeMin": 60,
    "distance": 35,
    "fareMax": 100,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE147",
    "toHubId": "Gangarampur",
    "fareMin": 50,
    "type": "Direct"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Kushmandi",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE148",
    "timeMin": 35,
    "fromHubId": "Gangarampur",
    "path": [
      "Gangarampur",
      "Kushmandi"
    ],
    "timeMax": 50,
    "distance": 20,
    "fareMax": 60
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE149",
    "type": "Direct",
    "fareMin": 80,
    "toHubId": "Hili",
    "timeMax": 80,
    "fromHubId": "Kushmandi",
    "path": [
      "Kushmandi",
      "Hili"
    ],
    "timeMin": 60,
    "fareMax": 150,
    "distance": 42
  },
  {
    "fareMax": 60,
    "distance": 25,
    "timeMin": 35,
    "timeMax": 50,
    "path": [
      "Hili",
      "Balurghat"
    ],
    "fromHubId": "Hili",
    "type": "Direct",
    "toHubId": "Balurghat",
    "fareMin": 30,
    "id": "ROUTE150",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMin": 10,
    "timeMax": 20,
    "fromHubId": "Raiganj",
    "path": [
      "Raiganj",
      "Kulik"
    ],
    "fareMax": 0,
    "distance": 35,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Kulik",
    "fareMin": 0,
    "id": "ROUTE151"
  },
  {
    "timeMin": 10,
    "fromHubId": "Kulik",
    "path": [
      "Kulik",
      "Bird Observation Towers"
    ],
    "timeMax": 20,
    "distance": 20,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Bird Observation Towers",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE152"
  },
  {
    "toHubId": "Wetland Zone",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE153",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 25,
    "fareMax": 0,
    "timeMin": 15,
    "fromHubId": "Kulik",
    "path": [
      "Kulik",
      "Wetland Zone"
    ],
    "timeMax": 30
  },
  {
    "timeMax": 60,
    "path": [
      "Raiganj",
      "Kaliaganj"
    ],
    "fromHubId": "Raiganj",
    "timeMin": 40,
    "fareMax": 80,
    "distance": 20,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE154",
    "type": "Direct",
    "toHubId": "Kaliaganj",
    "fareMin": 40
  },
  {
    "fareMax": 60,
    "distance": 35,
    "timeMin": 25,
    "timeMax": 50,
    "fromHubId": "Kaliaganj",
    "path": [
      "Kaliaganj",
      "Hemtabad"
    ],
    "type": "Direct",
    "toHubId": "Hemtabad",
    "fareMin": 30,
    "id": "ROUTE155",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "distance": 18,
    "fareMax": 60,
    "fromHubId": "Hemtabad",
    "path": [
      "Hemtabad",
      "Itahar"
    ],
    "timeMax": 50,
    "timeMin": 30,
    "id": "ROUTE156",
    "toHubId": "Itahar",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "path": [
      "Islampur",
      "Goalpokhar"
    ],
    "fromHubId": "Islampur",
    "timeMax": 50,
    "timeMin": 30,
    "distance": 22,
    "fareMax": 60,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE157",
    "toHubId": "Goalpokhar",
    "fareMin": 30,
    "type": "Direct"
  },
  {
    "toHubId": "Chopra",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE158",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 14,
    "fareMax": 60,
    "timeMin": 25,
    "fromHubId": "Goalpokhar",
    "path": [
      "Goalpokhar",
      "Chopra"
    ],
    "timeMax": 50
  },
  {
    "distance": 18,
    "fareMax": 50,
    "timeMin": 15,
    "fromHubId": "Chopra",
    "path": [
      "Chopra",
      "Border Tourism Areas"
    ],
    "timeMax": 30,
    "toHubId": "Border Tourism Areas",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE159",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Karandighi",
    "fareMin": 50,
    "type": "Direct",
    "id": "ROUTE160",
    "timeMin": 50,
    "fromHubId": "Raiganj",
    "path": [
      "Raiganj",
      "Karandighi"
    ],
    "timeMax": 60,
    "distance": 20,
    "fareMax": 100
  },
  {
    "fareMax": 50,
    "distance": 16,
    "timeMax": 25,
    "path": [
      "Karandighi",
      "Wetland Belt"
    ],
    "fromHubId": "Karandighi",
    "timeMin": 15,
    "id": "ROUTE161",
    "type": "Direct",
    "toHubId": "Wetland Belt",
    "fareMin": 20,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 10,
    "path": [
      "Wetland Belt",
      "Migratory Bird Zones"
    ],
    "fromHubId": "Wetland Belt",
    "timeMax": 20,
    "distance": 8,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Migratory Bird Zones",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE162"
  },
  {
    "fromHubId": "Raiganj",
    "path": [
      "Raiganj",
      "Kulik River Belt"
    ],
    "timeMax": 20,
    "timeMin": 10,
    "distance": 18,
    "fareMax": 40,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE163",
    "fareMin": 20,
    "toHubId": "Kulik River Belt",
    "type": "Direct"
  },
  {
    "fareMax": 0,
    "distance": 12,
    "timeMax": 40,
    "fromHubId": "Kulik Belt",
    "path": [
      "Kulik Belt",
      "Nagar River Belt"
    ],
    "timeMin": 25,
    "id": "ROUTE164",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Nagar River Belt",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 24,
    "fareMax": 0,
    "timeMin": 35,
    "fromHubId": "Nagar Belt",
    "path": [
      "Nagar Belt",
      "Mahananda Belt"
    ],
    "timeMax": 50,
    "toHubId": "Mahananda Belt",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE165",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "id": "ROUTE166",
    "type": "Direct",
    "toHubId": "Kaliaganj",
    "fareMin": 40,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 80,
    "distance": 18,
    "timeMax": 60,
    "path": [
      "Raiganj",
      "Kaliaganj"
    ],
    "fromHubId": "Raiganj",
    "timeMin": 40
  },
  {
    "fareMax": 80,
    "distance": 22,
    "timeMax": 50,
    "fromHubId": "Kaliaganj",
    "path": [
      "Kaliaganj",
      "Itahar"
    ],
    "timeMin": 35,
    "id": "ROUTE167",
    "type": "Direct",
    "fareMin": 40,
    "toHubId": "Itahar",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 16,
    "fareMax": 120,
    "path": [
      "Itahar",
      "Islampur"
    ],
    "fromHubId": "Itahar",
    "timeMax": 70,
    "timeMin": 55,
    "id": "ROUTE168",
    "toHubId": "Islampur",
    "fareMin": 60,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fareMax": 80,
    "distance": 14,
    "timeMax": 60,
    "fromHubId": "Islampur",
    "path": [
      "Islampur",
      "Chopra"
    ],
    "timeMin": 40,
    "id": "ROUTE169",
    "type": "Direct",
    "toHubId": "Chopra",
    "fareMin": 40,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 18,
    "fareMax": 60,
    "path": [
      "Chopra",
      "Goalpokhar"
    ],
    "fromHubId": "Chopra",
    "timeMax": 40,
    "timeMin": 25,
    "id": "ROUTE170",
    "fareMin": 30,
    "toHubId": "Goalpokhar",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 14,
    "fareMax": 250,
    "path": [
      "Darjeeling",
      "Kalimpong"
    ],
    "fromHubId": "Darjeeling",
    "timeMax": 150,
    "timeMin": 120,
    "id": "ROUTE171",
    "toHubId": "Kalimpong",
    "fareMin": 150,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE172",
    "toHubId": "Peshok",
    "fareMin": 80,
    "type": "Direct",
    "path": [
      "Darjeeling",
      "Peshok"
    ],
    "fromHubId": "Darjeeling",
    "timeMax": 80,
    "timeMin": 60,
    "distance": 70,
    "fareMax": 150
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Reshi",
    "id": "ROUTE173",
    "timeMin": 30,
    "timeMax": 50,
    "fromHubId": "Peshok",
    "path": [
      "Peshok",
      "Reshi"
    ],
    "fareMax": 100,
    "distance": 18
  },
  {
    "toHubId": "Kalimpong",
    "fareMin": 80,
    "type": "Direct",
    "id": "ROUTE174",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 18,
    "fareMax": 150,
    "timeMin": 45,
    "fromHubId": "Tinchuley",
    "path": [
      "Tinchuley",
      "Kalimpong"
    ],
    "timeMax": 60
  },
  {
    "fareMax": 180,
    "distance": 16,
    "timeMax": 120,
    "path": [
      "Mungpoo",
      "Kalimpong"
    ],
    "fromHubId": "Mungpoo",
    "timeMin": 90,
    "id": "ROUTE175",
    "type": "Direct",
    "fareMin": 100,
    "toHubId": "Kalimpong",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "fareMin": 100,
    "toHubId": "Pedong",
    "type": "Direct",
    "id": "ROUTE176",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 38,
    "fareMax": 180,
    "timeMin": 90,
    "fromHubId": "Lamahatta",
    "path": [
      "Lamahatta",
      "Pedong"
    ],
    "timeMax": 120
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Gorubathan",
    "fareMin": 80,
    "id": "ROUTE177",
    "timeMin": 60,
    "timeMax": 90,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Gorubathan"
    ],
    "fareMax": 150,
    "distance": 8
  },
  {
    "timeMin": 40,
    "timeMax": 60,
    "path": [
      "Gorubathan",
      "Odlabari"
    ],
    "fromHubId": "Gorubathan",
    "fareMax": 100,
    "distance": 32,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Odlabari",
    "id": "ROUTE178"
  },
  {
    "id": "ROUTE179",
    "type": "Direct",
    "toHubId": "Gajoldoba",
    "fareMin": 150,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 250,
    "distance": 35,
    "timeMax": 150,
    "fromHubId": "Kalimpong",
    "path": [
      "Kalimpong",
      "Gajoldoba"
    ],
    "timeMin": 120
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE180",
    "type": "Direct",
    "toHubId": "Odlabari",
    "fareMin": 80,
    "timeMax": 90,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Odlabari"
    ],
    "timeMin": 60,
    "fareMax": 150,
    "distance": 78
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 120,
    "toHubId": "Lataguri",
    "type": "Direct",
    "id": "ROUTE181",
    "timeMin": 90,
    "fromHubId": "Jhalong",
    "path": [
      "Jhalong",
      "Lataguri"
    ],
    "timeMax": 120,
    "distance": 32,
    "fareMax": 200
  },
  {
    "fromHubId": "Lataguri",
    "path": [
      "Lataguri",
      "Madarihat"
    ],
    "timeMax": 120,
    "timeMin": 90,
    "distance": 38,
    "fareMax": 180,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE182",
    "toHubId": "Madarihat",
    "fareMin": 100,
    "type": "Direct"
  },
  {
    "distance": 48,
    "fareMax": 180,
    "timeMin": 90,
    "fromHubId": "Murti",
    "path": [
      "Murti",
      "Hasimara"
    ],
    "timeMax": 120,
    "toHubId": "Hasimara",
    "fareMin": 100,
    "type": "Direct",
    "id": "ROUTE183",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE184",
    "type": "Direct",
    "toHubId": "Madarihat",
    "fareMin": 80,
    "timeMax": 90,
    "fromHubId": "Chalsa",
    "path": [
      "Chalsa",
      "Madarihat"
    ],
    "timeMin": 60,
    "fareMax": 150,
    "distance": 35
  },
  {
    "timeMin": 50,
    "fromHubId": "Nagrakata",
    "path": [
      "Nagrakata",
      "Hasimara"
    ],
    "timeMax": 70,
    "distance": 42,
    "fareMax": 120,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Hasimara",
    "fareMin": 60,
    "type": "Direct",
    "id": "ROUTE185"
  },
  {
    "distance": 26,
    "fareMax": 180,
    "timeMin": 120,
    "fromHubId": "Malbazar",
    "path": [
      "Malbazar",
      "Alipurduar"
    ],
    "timeMax": 150,
    "toHubId": "Alipurduar",
    "fareMin": 100,
    "type": "Direct",
    "id": "ROUTE186",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMin": 90,
    "timeMax": 120,
    "fromHubId": "Alipurduar",
    "path": [
      "Alipurduar",
      "Cooch Behar"
    ],
    "fareMax": 180,
    "distance": 72,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Cooch Behar",
    "fareMin": 100,
    "id": "ROUTE187"
  },
  {
    "timeMin": 60,
    "timeMax": 90,
    "fromHubId": "Hasimara",
    "path": [
      "Hasimara",
      "Cooch Behar"
    ],
    "fareMax": 150,
    "distance": 62,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Cooch Behar",
    "fareMin": 80,
    "id": "ROUTE188"
  },
  {
    "id": "ROUTE189",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Tufanganj",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 100,
    "distance": 75,
    "timeMax": 60,
    "fromHubId": "Kumargram",
    "path": [
      "Kumargram",
      "Tufanganj"
    ],
    "timeMin": 45
  },
  {
    "id": "ROUTE190",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Mathabhanga",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 100,
    "distance": 22,
    "timeMax": 60,
    "path": [
      "Falakata",
      "Mathabhanga"
    ],
    "fromHubId": "Falakata",
    "timeMin": 50
  },
  {
    "timeMin": 180,
    "timeMax": 240,
    "fromHubId": "Mekhliganj",
    "path": [
      "Mekhliganj",
      "Balurghat"
    ],
    "fareMax": 350,
    "distance": 28,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 200,
    "toHubId": "Balurghat",
    "id": "ROUTE191"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Gangarampur",
    "fareMin": 180,
    "type": "Direct",
    "id": "ROUTE192",
    "timeMin": 150,
    "path": [
      "Mathabhanga",
      "Gangarampur"
    ],
    "fromHubId": "Mathabhanga",
    "timeMax": 180,
    "distance": 26,
    "fareMax": 300
  },
  {
    "distance": 15,
    "fareMax": 400,
    "fromHubId": "Dinhata",
    "path": [
      "Dinhata",
      "Balurghat"
    ],
    "timeMax": 240,
    "timeMin": 210,
    "id": "ROUTE193",
    "toHubId": "Balurghat",
    "fareMin": 250,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "toHubId": "Raiganj",
    "fareMin": 50,
    "type": "Direct",
    "id": "ROUTE194",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 58,
    "fareMax": 100,
    "timeMin": 60,
    "fromHubId": "Gangarampur",
    "path": [
      "Gangarampur",
      "Raiganj"
    ],
    "timeMax": 90
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE195",
    "toHubId": "Raiganj",
    "fareMin": 120,
    "type": "Direct",
    "path": [
      "Balurghat",
      "Raiganj"
    ],
    "fromHubId": "Balurghat",
    "timeMax": 150,
    "timeMin": 120,
    "distance": 70,
    "fareMax": 200
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 40,
    "toHubId": "Kaliaganj",
    "type": "Direct",
    "id": "ROUTE196",
    "timeMin": 50,
    "fromHubId": "Kushmandi",
    "path": [
      "Kushmandi",
      "Kaliaganj"
    ],
    "timeMax": 70,
    "distance": 32,
    "fareMax": 80
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Siliguri",
    "fareMin": 20,
    "id": "ROUTE197",
    "timeMin": 15,
    "timeMax": 25,
    "path": [
      "NJP",
      "Siliguri"
    ],
    "fromHubId": "NJP",
    "fareMax": 50,
    "distance": 40
  },
  {
    "type": "Direct",
    "fareMin": 250,
    "toHubId": "Darjeeling",
    "id": "ROUTE198",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 400,
    "distance": 12,
    "timeMin": 120,
    "timeMax": 150,
    "fromHubId": "NJP",
    "path": [
      "NJP",
      "Darjeeling"
    ]
  },
  {
    "path": [
      "NJP",
      "Kurseong"
    ],
    "fromHubId": "NJP",
    "timeMax": 90,
    "timeMin": 60,
    "distance": 65,
    "fareMax": 250,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE199",
    "toHubId": "Kurseong",
    "fareMin": 150,
    "type": "Direct"
  },
  {
    "toHubId": "Mirik",
    "fareMin": 180,
    "type": "Direct",
    "id": "ROUTE200",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 35,
    "fareMax": 300,
    "timeMin": 120,
    "fromHubId": "NJP",
    "path": [
      "NJP",
      "Mirik"
    ],
    "timeMax": 150
  },
  {
    "fareMax": 400,
    "distance": 67,
    "timeMax": 150,
    "fromHubId": "NJP",
    "path": [
      "NJP",
      "Kalimpong"
    ],
    "timeMin": 120,
    "id": "ROUTE201",
    "type": "Direct",
    "fareMin": 250,
    "toHubId": "Kalimpong",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE202",
    "toHubId": "Lava",
    "fareMin": 300,
    "type": "Direct",
    "path": [
      "NJP",
      "Lava"
    ],
    "fromHubId": "NJP",
    "timeMax": 210,
    "timeMin": 180,
    "distance": 105,
    "fareMax": 500
  },
  {
    "id": "ROUTE203",
    "toHubId": "Lataguri",
    "fareMin": 150,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 75,
    "fareMax": 250,
    "fromHubId": "NJP",
    "path": [
      "NJP",
      "Lataguri"
    ],
    "timeMax": 150,
    "timeMin": 120
  },
  {
    "fareMax": 350,
    "distance": 85,
    "timeMax": 150,
    "fromHubId": "NJP",
    "path": [
      "NJP",
      "Murti"
    ],
    "timeMin": 120,
    "id": "ROUTE204",
    "type": "Direct",
    "toHubId": "Murti",
    "fareMin": 200,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 250,
    "toHubId": "Jhalong",
    "id": "ROUTE205",
    "timeMin": 180,
    "timeMax": 240,
    "path": [
      "NJP",
      "Jhalong"
    ],
    "fromHubId": "NJP",
    "fareMax": 400,
    "distance": 120
  },
  {
    "timeMin": 300,
    "path": [
      "NJP",
      "Jayanti"
    ],
    "fromHubId": "NJP",
    "timeMax": 400,
    "distance": 135,
    "fareMax": 600,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 400,
    "toHubId": "Jayanti",
    "type": "Direct",
    "id": "ROUTE206"
  },
  {
    "toHubId": "Darjeeling",
    "fareMin": 200,
    "type": "Direct",
    "id": "ROUTE207",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 65,
    "fareMax": 350,
    "timeMin": 120,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Darjeeling"
    ],
    "timeMax": 150
  },
  {
    "id": "ROUTE208",
    "type": "Direct",
    "toHubId": "Mirik",
    "fareMin": 120,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 200,
    "distance": 50,
    "timeMax": 90,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Mirik"
    ],
    "timeMin": 60
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Kurseong",
    "fareMin": 100,
    "type": "Direct",
    "id": "ROUTE209",
    "timeMin": 60,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Kurseong"
    ],
    "timeMax": 90,
    "distance": 35,
    "fareMax": 180
  },
  {
    "distance": 67,
    "fareMax": 300,
    "path": [
      "Siliguri",
      "Kalimpong"
    ],
    "fromHubId": "Siliguri",
    "timeMax": 150,
    "timeMin": 120,
    "id": "ROUTE210",
    "toHubId": "Kalimpong",
    "fareMin": 180,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "toHubId": "Lava",
    "fareMin": 250,
    "type": "Direct",
    "id": "ROUTE211",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 100,
    "fareMax": 400,
    "timeMin": 180,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Lava"
    ],
    "timeMax": 210
  },
  {
    "id": "ROUTE212",
    "type": "Direct",
    "toHubId": "Lataguri",
    "fareMin": 100,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 180,
    "distance": 75,
    "timeMax": 90,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Lataguri"
    ],
    "timeMin": 60
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Gajoldoba",
    "id": "ROUTE213",
    "timeMin": 45,
    "timeMax": 60,
    "path": [
      "Siliguri",
      "Gajoldoba"
    ],
    "fromHubId": "Siliguri",
    "fareMax": 100,
    "distance": 32
  },
  {
    "fareMax": 400,
    "distance": 130,
    "timeMax": 240,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Madarihat"
    ],
    "timeMin": 180,
    "id": "ROUTE214",
    "type": "Direct",
    "toHubId": "Madarihat",
    "fareMin": 250,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "id": "ROUTE215",
    "type": "Direct",
    "toHubId": "Jayanti",
    "fareMin": 400,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 600,
    "distance": 145,
    "timeMax": 400,
    "fromHubId": "Siliguri",
    "path": [
      "Siliguri",
      "Jayanti"
    ],
    "timeMin": 300
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 250,
    "toHubId": "Darjeeling",
    "type": "Direct",
    "id": "ROUTE216",
    "timeMin": 120,
    "path": [
      "Bagdogra",
      "Darjeeling"
    ],
    "fromHubId": "Bagdogra",
    "timeMax": 150,
    "distance": 70,
    "fareMax": 400
  },
  {
    "distance": 55,
    "fareMax": 250,
    "fromHubId": "Bagdogra",
    "path": [
      "Bagdogra",
      "Mirik"
    ],
    "timeMax": 90,
    "timeMin": 60,
    "id": "ROUTE217",
    "toHubId": "Mirik",
    "fareMin": 150,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "id": "ROUTE218",
    "type": "Direct",
    "fareMin": 120,
    "toHubId": "Kurseong",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 200,
    "distance": 35,
    "timeMax": 90,
    "path": [
      "Bagdogra",
      "Kurseong"
    ],
    "fromHubId": "Bagdogra",
    "timeMin": 60
  },
  {
    "distance": 72,
    "fareMax": 400,
    "timeMin": 120,
    "path": [
      "Bagdogra",
      "Kalimpong"
    ],
    "fromHubId": "Bagdogra",
    "timeMax": 150,
    "fareMin": 250,
    "toHubId": "Kalimpong",
    "type": "Direct",
    "id": "ROUTE219",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "type": "Direct",
    "toHubId": "Lava",
    "fareMin": 300,
    "id": "ROUTE220",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 500,
    "distance": 105,
    "timeMin": 180,
    "timeMax": 210,
    "path": [
      "Bagdogra",
      "Lava"
    ],
    "fromHubId": "Bagdogra"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE221",
    "type": "Direct",
    "toHubId": "Lataguri",
    "fareMin": 150,
    "timeMax": 90,
    "fromHubId": "Bagdogra",
    "path": [
      "Bagdogra",
      "Lataguri"
    ],
    "timeMin": 60,
    "fareMax": 250,
    "distance": 80
  },
  {
    "timeMax": 210,
    "fromHubId": "Bagdogra",
    "path": [
      "Bagdogra",
      "Jhalong"
    ],
    "timeMin": 180,
    "fareMax": 400,
    "distance": 115,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE222",
    "type": "Direct",
    "toHubId": "Jhalong",
    "fareMin": 250
  },
  {
    "id": "ROUTE223",
    "toHubId": "Jayanti",
    "fareMin": 400,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 130,
    "fareMax": 600,
    "fromHubId": "Bagdogra",
    "path": [
      "Bagdogra",
      "Jayanti"
    ],
    "timeMax": 300,
    "timeMin": 240
  },
  {
    "timeMin": 40,
    "timeMax": 60,
    "path": [
      "Darjeeling",
      "Dawaipani"
    ],
    "fromHubId": "Darjeeling",
    "fareMax": 80,
    "distance": 20,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Dawaipani",
    "fareMin": 40,
    "id": "ROUTE224"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Lepchajagat",
    "id": "ROUTE225",
    "timeMin": 50,
    "timeMax": 70,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Lepchajagat"
    ],
    "fareMax": 100,
    "distance": 11
  },
  {
    "fareMax": 0,
    "distance": 4,
    "timeMin": 10,
    "timeMax": 20,
    "path": [
      "Darjeeling",
      "North Point"
    ],
    "fromHubId": "Darjeeling",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "North Point",
    "id": "ROUTE226",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMin": 15,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Jalapahar"
    ],
    "timeMax": 30,
    "distance": 5,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 0,
    "toHubId": "Jalapahar",
    "type": "Direct",
    "id": "ROUTE227"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Singla",
    "fareMin": 40,
    "type": "Direct",
    "id": "ROUTE228",
    "timeMin": 45,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Singla"
    ],
    "timeMax": 60,
    "distance": 8,
    "fareMax": 80
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE229",
    "toHubId": "Ghayabari",
    "fareMin": 60,
    "type": "Direct",
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Ghayabari"
    ],
    "timeMax": 90,
    "timeMin": 60,
    "distance": 12,
    "fareMax": 120
  },
  {
    "distance": 16,
    "fareMax": 60,
    "timeMin": 30,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Rangbull"
    ],
    "timeMax": 30,
    "toHubId": "Rangbull",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE230",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "id": "ROUTE231",
    "type": "Direct",
    "fareMin": 30,
    "toHubId": "Tingling",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 60,
    "distance": 14,
    "timeMax": 50,
    "path": [
      "Kurseong",
      "Tingling"
    ],
    "fromHubId": "Kurseong",
    "timeMin": 30
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE232",
    "type": "Direct",
    "fareMin": 40,
    "toHubId": "Mahaldiram",
    "timeMax": 60,
    "path": [
      "Kurseong",
      "Mahaldiram"
    ],
    "fromHubId": "Kurseong",
    "timeMin": 40,
    "fareMax": 80,
    "distance": 12
  },
  {
    "type": "Direct",
    "toHubId": "Gayabari",
    "fareMin": 20,
    "id": "ROUTE233",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 50,
    "distance": 10,
    "timeMin": 25,
    "timeMax": 40,
    "fromHubId": "Kurseong",
    "path": [
      "Kurseong",
      "Gayabari"
    ]
  },
  {
    "timeMin": 25,
    "timeMax": 40,
    "path": [
      "Kurseong",
      "Ambootia"
    ],
    "fromHubId": "Kurseong",
    "fareMax": 60,
    "distance": 8,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 30,
    "toHubId": "Ambootia",
    "id": "ROUTE234"
  },
  {
    "distance": 9,
    "fareMax": 0,
    "fromHubId": "Ambootia",
    "path": [
      "Ambootia",
      "Castleton"
    ],
    "timeMax": 20,
    "timeMin": 10,
    "id": "ROUTE235",
    "toHubId": "Castleton",
    "fareMin": 0,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 15,
    "timeMax": 30,
    "fromHubId": "Castleton",
    "path": [
      "Castleton",
      "Margaret's Hope"
    ],
    "fareMax": 0,
    "distance": 14,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Margaret's Hope",
    "fareMin": 0,
    "id": "ROUTE236"
  },
  {
    "distance": 7,
    "fareMax": 50,
    "timeMin": 25,
    "fromHubId": "Sukhiapokhri",
    "path": [
      "Sukhiapokhri",
      "Manebhanjan"
    ],
    "timeMax": 40,
    "toHubId": "Manebhanjan",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE237",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "id": "ROUTE238",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Bikeybhanjang",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 0,
    "distance": 12,
    "timeMax": 150,
    "path": [
      "Kalipokhri",
      "Bikeybhanjang"
    ],
    "fromHubId": "Kalipokhri",
    "timeMin": 120
  },
  {
    "type": "Direct",
    "toHubId": "Sandakphu",
    "fareMin": 0,
    "id": "ROUTE239",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 0,
    "distance": 7,
    "timeMin": 120,
    "timeMax": 150,
    "fromHubId": "Bikeybhanjang",
    "path": [
      "Bikeybhanjang",
      "Sandakphu"
    ]
  },
  {
    "fareMax": 0,
    "distance": 21,
    "timeMax": 400,
    "path": [
      "Sandakphu",
      "Sabagram"
    ],
    "fromHubId": "Sandakphu",
    "timeMin": 300,
    "id": "ROUTE240",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Sabagram",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "toHubId": "Phalut",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE241",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 15,
    "fareMax": 0,
    "timeMin": 180,
    "fromHubId": "Sabagram",
    "path": [
      "Sabagram",
      "Phalut"
    ],
    "timeMax": 210
  },
  {
    "distance": 15,
    "fareMax": 220,
    "timeMin": 120,
    "path": [
      "Rimbik",
      "Darjeeling"
    ],
    "fromHubId": "Rimbik",
    "timeMax": 150,
    "fareMin": 120,
    "toHubId": "Darjeeling",
    "type": "Direct",
    "id": "ROUTE242",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "timeMin": 180,
    "timeMax": 210,
    "fromHubId": "Kaiyakatta",
    "path": [
      "Kaiyakatta",
      "Kalipokhri"
    ],
    "fareMax": 0,
    "distance": 85,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Kalipokhri",
    "id": "ROUTE243"
  },
  {
    "fareMax": 100,
    "distance": 14,
    "timeMax": 60,
    "fromHubId": "Kalimpong",
    "path": [
      "Kalimpong",
      "Munsong"
    ],
    "timeMin": 45,
    "id": "ROUTE244",
    "type": "Direct",
    "toHubId": "Munsong",
    "fareMin": 50,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 40,
    "path": [
      "Kalimpong",
      "Pabong"
    ],
    "fromHubId": "Kalimpong",
    "timeMax": 60,
    "distance": 16,
    "fareMax": 80,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Pabong",
    "fareMin": 40,
    "type": "Direct",
    "id": "ROUTE245"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE246",
    "fareMin": 60,
    "toHubId": "Lingsey",
    "type": "Direct",
    "fromHubId": "Pedong",
    "path": [
      "Pedong",
      "Lingsey"
    ],
    "timeMax": 60,
    "timeMin": 45,
    "distance": 22,
    "fareMax": 120
  },
  {
    "fareMax": 100,
    "distance": 18,
    "timeMin": 55,
    "timeMax": 70,
    "path": [
      "Pedong",
      "Rongli"
    ],
    "fromHubId": "Pedong",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Rongli",
    "id": "ROUTE247",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "id": "ROUTE248",
    "type": "Direct",
    "toHubId": "Reshikhola",
    "fareMin": 40,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 80,
    "distance": 13,
    "timeMax": 30,
    "path": [
      "Rongli",
      "Reshikhola"
    ],
    "fromHubId": "Rongli",
    "timeMin": 20
  },
  {
    "distance": 11,
    "fareMax": 100,
    "timeMin": 60,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Gitdubling"
    ],
    "timeMax": 90,
    "fareMin": 50,
    "toHubId": "Gitdubling",
    "type": "Direct",
    "id": "ROUTE249",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Suntalekhola",
    "fareMin": 20,
    "id": "ROUTE250",
    "timeMin": 15,
    "timeMax": 30,
    "fromHubId": "Samsing",
    "path": [
      "Samsing",
      "Suntalekhola"
    ],
    "fareMax": 50,
    "distance": 9
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE251",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Rocky Island",
    "timeMax": 20,
    "fromHubId": "Suntalekhola",
    "path": [
      "Suntalekhola",
      "Rocky Island"
    ],
    "timeMin": 10,
    "fareMax": 0,
    "distance": 6
  },
  {
    "toHubId": "Jaldhaka",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE252",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 18,
    "fareMax": 50,
    "timeMin": 10,
    "path": [
      "Jhalong",
      "Jaldhaka"
    ],
    "fromHubId": "Jhalong",
    "timeMax": 20
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE253",
    "type": "Direct",
    "toHubId": "Chuikhim",
    "fareMin": 30,
    "timeMax": 40,
    "fromHubId": "Paren",
    "path": [
      "Paren",
      "Chuikhim"
    ],
    "timeMin": 25,
    "fareMax": 60,
    "distance": 14
  },
  {
    "type": "Direct",
    "toHubId": "Todey",
    "fareMin": 0,
    "id": "ROUTE254",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 0,
    "distance": 12,
    "timeMin": 45,
    "timeMax": 60,
    "fromHubId": "Chuikhim",
    "path": [
      "Chuikhim",
      "Todey"
    ]
  },
  {
    "fareMax": 60,
    "distance": 8,
    "timeMin": 25,
    "timeMax": 40,
    "path": [
      "Rajabhatkhawa",
      "Santalabari"
    ],
    "fromHubId": "Rajabhatkhawa",
    "type": "Direct",
    "toHubId": "Santalabari",
    "fareMin": 30,
    "id": "ROUTE255",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Buxa Fort",
    "fareMin": 0,
    "id": "ROUTE256",
    "timeMin": 120,
    "timeMax": 150,
    "fromHubId": "Santalabari",
    "path": [
      "Santalabari",
      "Buxa Fort"
    ],
    "fareMax": 0,
    "distance": 14
  },
  {
    "fromHubId": "Buxa Fort",
    "path": [
      "Buxa Fort",
      "Lepchakha"
    ],
    "timeMax": 90,
    "timeMin": 60,
    "distance": 5,
    "fareMax": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE257",
    "fareMin": 0,
    "toHubId": "Lepchakha",
    "type": "Direct"
  },
  {
    "timeMin": 120,
    "fromHubId": "Jayanti",
    "path": [
      "Jayanti",
      "Mahakal Cave Access"
    ],
    "timeMax": 150,
    "distance": 12,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Mahakal Cave Access",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE258"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE259",
    "type": "Direct",
    "toHubId": "Mendabari",
    "fareMin": 20,
    "timeMax": 30,
    "fromHubId": "Chilapata",
    "path": [
      "Chilapata",
      "Mendabari"
    ],
    "timeMin": 20,
    "fareMax": 50,
    "distance": 6
  },
  {
    "id": "ROUTE260",
    "toHubId": "Bangarh",
    "fareMin": 0,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 24,
    "fareMax": 0,
    "fromHubId": "Gangarampur",
    "path": [
      "Gangarampur",
      "Bangarh"
    ],
    "timeMax": 20,
    "timeMin": 10
  },
  {
    "timeMin": 15,
    "timeMax": 25,
    "fromHubId": "Kushmandi",
    "path": [
      "Kushmandi",
      "Wooden Mask Village Cluster"
    ],
    "fareMax": 40,
    "distance": 12,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Wooden Mask Village Cluster",
    "fareMin": 20,
    "id": "ROUTE261"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Kulik",
    "fareMin": 0,
    "id": "ROUTE262",
    "timeMin": 10,
    "timeMax": 20,
    "fromHubId": "Raiganj",
    "path": [
      "Raiganj",
      "Kulik"
    ],
    "fareMax": 0,
    "distance": 18
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE263",
    "type": "Direct",
    "toHubId": "Goalpokhar",
    "fareMin": 30,
    "timeMax": 50,
    "path": [
      "Karandighi",
      "Goalpokhar"
    ],
    "fromHubId": "Karandighi",
    "timeMin": 30,
    "fareMax": 60,
    "distance": 55
  },
  {
    "id": "ROUTE264",
    "type": "Direct",
    "toHubId": "Kurseong",
    "fareMin": 80,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 150,
    "distance": 30,
    "timeMax": 90,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Kurseong"
    ],
    "timeMin": 60
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Siliguri",
    "fareMin": 80,
    "type": "Direct",
    "id": "ROUTE265",
    "timeMin": 60,
    "fromHubId": "Kurseong",
    "path": [
      "Kurseong",
      "Siliguri"
    ],
    "timeMax": 90,
    "distance": 35,
    "fareMax": 150
  },
  {
    "fareMax": 180,
    "distance": 50,
    "timeMax": 150,
    "path": [
      "Darjeeling",
      "Mirik"
    ],
    "fromHubId": "Darjeeling",
    "timeMin": 120,
    "id": "ROUTE266",
    "type": "Direct",
    "fareMin": 100,
    "toHubId": "Mirik",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE267",
    "type": "Direct",
    "toHubId": "Kalimpong",
    "fareMin": 150,
    "timeMax": 150,
    "fromHubId": "Darjeeling",
    "path": [
      "Darjeeling",
      "Kalimpong"
    ],
    "timeMin": 120,
    "fareMax": 250,
    "distance": 70
  },
  {
    "timeMax": 90,
    "path": [
      "Kalimpong",
      "Lava"
    ],
    "fromHubId": "Kalimpong",
    "timeMin": 60,
    "fareMax": 150,
    "distance": 34,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE268",
    "type": "Direct",
    "toHubId": "Lava",
    "fareMin": 80
  },
  {
    "timeMin": 45,
    "timeMax": 60,
    "path": [
      "Kalimpong",
      "Pedong"
    ],
    "fromHubId": "Kalimpong",
    "fareMax": 80,
    "distance": 22,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Pedong",
    "fareMin": 40,
    "id": "ROUTE269"
  },
  {
    "timeMin": 60,
    "timeMax": 90,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Gorubathan"
    ],
    "fareMax": 150,
    "distance": 32,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 80,
    "toHubId": "Gorubathan",
    "id": "ROUTE270"
  },
  {
    "fareMax": 100,
    "distance": 8,
    "timeMin": 40,
    "timeMax": 60,
    "fromHubId": "Gorubathan",
    "path": [
      "Gorubathan",
      "Odlabari"
    ],
    "type": "Direct",
    "toHubId": "Odlabari",
    "fareMin": 50,
    "id": "ROUTE271",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "fareMax": 60,
    "distance": 35,
    "timeMax": 70,
    "fromHubId": "Odlabari",
    "path": [
      "Odlabari",
      "Lataguri"
    ],
    "timeMin": 50,
    "id": "ROUTE272",
    "type": "Direct",
    "fareMin": 30,
    "toHubId": "Lataguri",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMax": 30,
    "path": [
      "Lataguri",
      "Murti"
    ],
    "fromHubId": "Lataguri",
    "timeMin": 20,
    "fareMax": 60,
    "distance": 10,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE273",
    "type": "Direct",
    "toHubId": "Murti",
    "fareMin": 30
  },
  {
    "distance": 8,
    "fareMax": 50,
    "fromHubId": "Murti",
    "path": [
      "Murti",
      "Chalsa"
    ],
    "timeMax": 30,
    "timeMin": 15,
    "id": "ROUTE274",
    "toHubId": "Chalsa",
    "fareMin": 20,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "distance": 14,
    "fareMax": 60,
    "fromHubId": "Chalsa",
    "path": [
      "Chalsa",
      "Nagrakata"
    ],
    "timeMax": 50,
    "timeMin": 35,
    "id": "ROUTE275",
    "toHubId": "Nagrakata",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 45,
    "timeMax": 60,
    "fromHubId": "Nagrakata",
    "path": [
      "Nagrakata",
      "Madarihat"
    ],
    "fareMax": 100,
    "distance": 20,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "fareMin": 50,
    "toHubId": "Madarihat",
    "id": "ROUTE276"
  },
  {
    "path": [
      "Madarihat",
      "Hasimara"
    ],
    "fromHubId": "Madarihat",
    "timeMax": 30,
    "timeMin": 20,
    "distance": 16,
    "fareMax": 50,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE277",
    "toHubId": "Hasimara",
    "fareMin": 20,
    "type": "Direct"
  },
  {
    "fromHubId": "Hasimara",
    "path": [
      "Hasimara",
      "Alipurduar"
    ],
    "timeMax": 60,
    "timeMin": 45,
    "distance": 28,
    "fareMax": 100,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE278",
    "toHubId": "Alipurduar",
    "fareMin": 50,
    "type": "Direct"
  },
  {
    "distance": 18,
    "fareMax": 60,
    "timeMin": 25,
    "fromHubId": "Alipurduar",
    "path": [
      "Alipurduar",
      "Rajabhatkhawa"
    ],
    "timeMax": 40,
    "toHubId": "Rajabhatkhawa",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE279",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "fareMax": 80,
    "distance": 22,
    "timeMax": 50,
    "path": [
      "Rajabhatkhawa",
      "Jayanti"
    ],
    "fromHubId": "Rajabhatkhawa",
    "timeMin": 30,
    "id": "ROUTE280",
    "type": "Direct",
    "toHubId": "Jayanti",
    "fareMin": 40,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "type": "Direct",
    "toHubId": "Reshi",
    "fareMin": 50,
    "id": "ROUTE281",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 100,
    "distance": 18,
    "timeMin": 30,
    "timeMax": 50,
    "fromHubId": "Peshok",
    "path": [
      "Peshok",
      "Reshi"
    ]
  },
  {
    "fareMin": 80,
    "toHubId": "Kalimpong",
    "type": "Direct",
    "id": "ROUTE282",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 16,
    "fareMax": 150,
    "timeMin": 45,
    "path": [
      "Tinchuley",
      "Kalimpong"
    ],
    "fromHubId": "Tinchuley",
    "timeMax": 60
  },
  {
    "fromHubId": "Mungpoo",
    "path": [
      "Mungpoo",
      "Kalimpong"
    ],
    "timeMax": 90,
    "timeMin": 60,
    "distance": 38,
    "fareMax": 180,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE283",
    "toHubId": "Kalimpong",
    "fareMin": 100,
    "type": "Direct"
  },
  {
    "timeMin": 60,
    "fromHubId": "Lava",
    "path": [
      "Lava",
      "Odlabari"
    ],
    "timeMax": 90,
    "distance": 32,
    "fareMax": 150,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Odlabari",
    "fareMin": 80,
    "type": "Direct",
    "id": "ROUTE284"
  },
  {
    "type": "Direct",
    "toHubId": "Lataguri",
    "fareMin": 120,
    "id": "ROUTE285",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 200,
    "distance": 75,
    "timeMin": 60,
    "timeMax": 90,
    "fromHubId": "Jhalong",
    "path": [
      "Jhalong",
      "Lataguri"
    ]
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE286",
    "toHubId": "Madarihat",
    "fareMin": 100,
    "type": "Direct",
    "fromHubId": "Lataguri",
    "path": [
      "Lataguri",
      "Madarihat"
    ],
    "timeMax": 90,
    "timeMin": 60,
    "distance": 38,
    "fareMax": 180
  },
  {
    "toHubId": "Tufanganj",
    "fareMin": 50,
    "type": "Direct",
    "id": "ROUTE287",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 58,
    "fareMax": 100,
    "timeMin": 45,
    "path": [
      "Kumargram",
      "Tufanganj"
    ],
    "fromHubId": "Kumargram",
    "timeMax": 60
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 50,
    "toHubId": "Raiganj",
    "type": "Direct",
    "id": "ROUTE288",
    "timeMin": 60,
    "path": [
      "Gangarampur",
      "Raiganj"
    ],
    "fromHubId": "Gangarampur",
    "timeMax": 90,
    "distance": 15,
    "fareMax": 100
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Balurghat",
    "fareMin": 20,
    "id": "ROUTE289",
    "timeMin": 30,
    "timeMax": 50,
    "fromHubId": "Atrai Belt",
    "path": [
      "Atrai Belt",
      "Balurghat"
    ],
    "fareMax": 40,
    "distance": 20
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE290",
    "type": "Direct",
    "toHubId": "Raiganj",
    "fareMin": 20,
    "timeMax": 30,
    "fromHubId": "Kulik Belt",
    "path": [
      "Kulik Belt",
      "Raiganj"
    ],
    "timeMin": 15,
    "fareMax": 40,
    "distance": 18
  },
  {
    "timeMax": 40,
    "path": [
      "Nagar Belt",
      "Raiganj"
    ],
    "fromHubId": "Nagar Belt",
    "timeMin": 25,
    "fareMax": 40,
    "distance": 22,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE291",
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Raiganj"
  },
  {
    "distance": 12,
    "fareMax": 60,
    "timeMin": 20,
    "path": [
      "Delo",
      "Durpin"
    ],
    "fromHubId": "Delo",
    "timeMax": 30,
    "toHubId": "Durpin",
    "fareMin": 30,
    "type": "Direct",
    "id": "ROUTE292",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE293",
    "toHubId": "Tarkhola",
    "fareMin": 0,
    "type": "Direct",
    "fromHubId": "Durpin",
    "path": [
      "Durpin",
      "Tarkhola"
    ],
    "timeMax": 50,
    "timeMin": 30,
    "distance": 14,
    "fareMax": 0
  },
  {
    "type": "Direct",
    "toHubId": "Munsong",
    "fareMin": 20,
    "id": "ROUTE294",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 50,
    "distance": 10,
    "timeMin": 20,
    "timeMax": 30,
    "fromHubId": "Pabong",
    "path": [
      "Pabong",
      "Munsong"
    ]
  },
  {
    "distance": 12,
    "fareMax": 60,
    "fromHubId": "Munsong",
    "path": [
      "Munsong",
      "Algarah"
    ],
    "timeMax": 40,
    "timeMin": 25,
    "id": "ROUTE295",
    "toHubId": "Algarah",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE296",
    "fareMin": 0,
    "toHubId": "Mankhim",
    "type": "Direct",
    "fromHubId": "Lingsey",
    "path": [
      "Lingsey",
      "Mankhim"
    ],
    "timeMax": 40,
    "timeMin": 20,
    "distance": 11,
    "fareMax": 0
  },
  {
    "distance": 13,
    "fareMax": 60,
    "path": [
      "Lingsey",
      "Rongli"
    ],
    "fromHubId": "Lingsey",
    "timeMax": 40,
    "timeMin": 25,
    "id": "ROUTE297",
    "toHubId": "Rongli",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "toHubId": "Mankhim",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE298",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "distance": 8,
    "fareMax": 0,
    "timeMin": 30,
    "path": [
      "Reshikhola",
      "Mankhim"
    ],
    "fromHubId": "Reshikhola",
    "timeMax": 50
  },
  {
    "fromHubId": "Gitdubling",
    "path": [
      "Gitdubling",
      "Jhalong"
    ],
    "timeMax": 40,
    "timeMin": 20,
    "distance": 14,
    "fareMax": 50,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE299",
    "toHubId": "Jhalong",
    "fareMin": 20,
    "type": "Direct"
  },
  {
    "fareMax": 0,
    "distance": 10,
    "timeMax": 30,
    "path": [
      "Rocky Island",
      "Samsing"
    ],
    "fromHubId": "Rocky Island",
    "timeMin": 15,
    "id": "ROUTE300",
    "type": "Direct",
    "toHubId": "Samsing",
    "fareMin": 0,
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "type": "Direct",
    "toHubId": "Gorubathan",
    "fareMin": 50,
    "id": "ROUTE301",
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMax": 100,
    "distance": 12,
    "timeMin": 40,
    "timeMax": 60,
    "fromHubId": "Suntalekhola",
    "path": [
      "Suntalekhola",
      "Gorubathan"
    ]
  },
  {
    "distance": 10,
    "fareMax": 0,
    "fromHubId": "Mahaldiram",
    "path": [
      "Mahaldiram",
      "Bagora"
    ],
    "timeMax": 50,
    "timeMin": 35,
    "id": "ROUTE302",
    "toHubId": "Bagora",
    "fareMin": 0,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "timeMin": 25,
    "fromHubId": "Tingling",
    "path": [
      "Tingling",
      "Soureni"
    ],
    "timeMax": 50,
    "distance": 8,
    "fareMax": 0,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Soureni",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE303"
  },
  {
    "id": "ROUTE304",
    "type": "Direct",
    "fareMin": 0,
    "toHubId": "Makaibari",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 0,
    "distance": 9,
    "timeMax": 30,
    "fromHubId": "Castleton",
    "path": [
      "Castleton",
      "Makaibari"
    ],
    "timeMin": 20
  },
  {
    "fromHubId": "Margaret's Hope",
    "path": [
      "Margaret's Hope",
      "Ambootia"
    ],
    "timeMax": 30,
    "timeMin": 15,
    "distance": 11,
    "fareMax": 0,
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE305",
    "toHubId": "Ambootia",
    "fareMin": 0,
    "type": "Direct"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Jalapahar",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE306",
    "timeMin": 10,
    "path": [
      "North Point",
      "Jalapahar"
    ],
    "fromHubId": "North Point",
    "timeMax": 20,
    "distance": 4,
    "fareMax": 0
  },
  {
    "id": "ROUTE307",
    "fareMin": 30,
    "toHubId": "Rangbull",
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 8,
    "fareMax": 60,
    "path": [
      "Dawaipani",
      "Rangbull"
    ],
    "fromHubId": "Dawaipani",
    "timeMax": 50,
    "timeMin": 30
  },
  {
    "fareMax": 50,
    "distance": 18,
    "timeMax": 40,
    "path": [
      "Lepchajagat",
      "Sukhiapokhri"
    ],
    "fromHubId": "Lepchajagat",
    "timeMin": 25,
    "id": "ROUTE308",
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Sukhiapokhri",
    "lastUpdated": "01-06-2026",
    "verified": true
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE309",
    "fareMin": 0,
    "toHubId": "Jayanti",
    "type": "Direct",
    "path": [
      "Buxa Fort",
      "Jayanti"
    ],
    "fromHubId": "Buxa Fort",
    "timeMax": 400,
    "timeMin": 300,
    "distance": 12,
    "fareMax": 0
  },
  {
    "distance": 24,
    "fareMax": 0,
    "timeMin": 240,
    "path": [
      "Lepchakha",
      "Jayanti"
    ],
    "fromHubId": "Lepchakha",
    "timeMax": 300,
    "toHubId": "Jayanti",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE310",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "toHubId": "Buxa Fort",
    "fareMin": 0,
    "type": "Direct",
    "id": "ROUTE311",
    "timeMin": 180,
    "path": [
      "Mahakal Cave Access",
      "Buxa Fort"
    ],
    "fromHubId": "Mahakal Cave Access",
    "timeMax": 240,
    "distance": 5,
    "fareMax": 0
  },
  {
    "id": "ROUTE312",
    "type": "Direct",
    "fareMin": 20,
    "toHubId": "Cooch Behar",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "fareMax": 40,
    "distance": 28,
    "timeMax": 35,
    "path": [
      "Baneswar",
      "Cooch Behar"
    ],
    "fromHubId": "Baneswar",
    "timeMin": 20
  },
  {
    "timeMin": 20,
    "fromHubId": "Rasik Beel",
    "path": [
      "Rasik Beel",
      "Tufanganj"
    ],
    "timeMax": 35,
    "distance": 22,
    "fareMax": 60,
    "verified": true,
    "lastUpdated": "01-06-2026",
    "fareMin": 30,
    "toHubId": "Tufanganj",
    "type": "Direct",
    "id": "ROUTE313"
  },
  {
    "lastUpdated": "01-06-2026",
    "verified": true,
    "id": "ROUTE314",
    "fareMin": 30,
    "toHubId": "Kushmandi",
    "type": "Direct",
    "path": [
      "Bangarh",
      "Kushmandi"
    ],
    "fromHubId": "Bangarh",
    "timeMax": 50,
    "timeMin": 30,
    "distance": 18,
    "fareMax": 60
  },
  {
    "verified": true,
    "lastUpdated": "01-06-2026",
    "type": "Direct",
    "toHubId": "Kaliaganj",
    "fareMin": 40,
    "id": "ROUTE315",
    "timeMin": 40,
    "timeMax": 60,
    "fromHubId": "Kulik",
    "path": [
      "Kulik",
      "Kaliaganj"
    ],
    "fareMax": 80,
    "distance": 14
  },
  {
    "distance": 12,
    "fareMax": 50,
    "timeMin": 20,
    "path": [
      "Bindu",
      "Jaldhaka"
    ],
    "fromHubId": "Bindu",
    "timeMax": 40,
    "toHubId": "Jaldhaka",
    "fareMin": 20,
    "type": "Direct",
    "id": "ROUTE316",
    "verified": true,
    "lastUpdated": "01-06-2026"
  },
  {
    "id": "ROUTE317",
    "toHubId": "Paren",
    "fareMin": 30,
    "type": "Direct",
    "lastUpdated": "01-06-2026",
    "verified": true,
    "distance": 16,
    "fareMax": 60,
    "fromHubId": "Jaldhaka",
    "path": [
      "Jaldhaka",
      "Paren"
    ],
    "timeMax": 50,
    "timeMin": 30
  },
  {
    "fareMax": 100,
    "distance": 12,
    "timeMin": 40,
    "timeMax": 60,
    "fromHubId": "Paren",
    "path": [
      "Paren",
      "Todey"
    ],
    "type": "Direct",
    "toHubId": "Todey",
    "fareMin": 50,
    "id": "ROUTE318",
    "verified": true,
    "lastUpdated": "01-06-2026"
  }
];
