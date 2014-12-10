// Sync variables
var category = 'city';
var name_label = 'City';
var all_years = [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
var city_all_classes = [1, 2, 3, 'Town'];
var city_table_fields = [
  'Population',
  'Class',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  //'General Fund Balance',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Form of Government',
  'Government Powers',
  'Council Size',
  'Type of Election'
];
var city_numeric_fields = [
  'Population',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  //'General Fund Balance',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Council Size'
];
var city_historical_fields = [
  'Population',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  //'General Fund Balance',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Council Size'
];
var city_comparison_fields = [
  'Population',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  //'General Fund Balance',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Council Size'
];
var city_map_fields = [
  'Population',
  'Class',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  //'General Fund Balance',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Council Size',
  'Form of Government',
  'Government Powers',
  'Type of Election'
];
var city_info_fields = [
  'Population',
  'Class',
  'Taxable Valuation (Mill Value)',
  'Total Mills Levied',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Council Size',
  'Form of Government',
  'Government Powers'
];
var city_order_fields = [
  //'Population',
  //'Class',
  'Form of Government'
];
// Note formgov_order same for sity or county
var formgov_order = {
  'Com': 0,
  'Com PO': 1,
  'Com(A)': 2,
  'Com(C)': 3,
  'Com Ex': 4,
  'Com Ex(A)': 5,
  'Com Ex(C)': 6,
  'Mgr': 7,
  'Mgr(A)': 8,
  'Mgr(C)': 9,
  'TM(C)': 10,
  'No proposal': 11,
  'NA': 20
};
var all_cities = [
  "Alberton",
  "Bainville",
  "Baker",
  "Bearcreek",
  "Belgrade",
  "Belt",
  "Big Sandy",
  "Big Timber",
  "Billings",
  "Boulder",
  "Bozeman",
  "Bridger",
  "Broadus",
  "Broadview",
  "Brockton",
  "Browning",
  "Cascade",
  "Chester",
  "Chinook",
  "Choteau",
  "Circle",
  "Clyde Park",
  "Colstrip",
  "Columbia Falls",
  "Columbus",
  "Conrad",
  "Culbertson",
  "Cut Bank",
  "Darby",
  "Deer Lodge",
  "Denton",
  "Dillon",
  "Dodson",
  "Drummond",
  "Dutton",
  "East Helena",
  "Ekalaka",
  "Ennis",
  "Eureka",
  "Fairfield",
  "Fairview",
  "Flaxville",
  "Forsyth",
  "Fort Benton",
  "Fort Peck",
  "Froid",
  "Fromberg",
  "Geraldine",
  "Glasgow",
  "Glendive",
  "Grass Range",
  "Great Falls",
  "Hamilton",
  "Hardin",
  "Harlem",
  "Harlowton",
  "Havre",
  "Helena",
  "Hingham",
  "Hobson",
  "Hot Springs",
  "Hysham",
  "Ismay",
  "Joliet",
  "Jordan",
  "Judith Gap",
  "Kalispell",
  "Kevin",
  "Laurel",
  "Lavina",
  "Lewistown",
  "Libby",
  "Lima",
  "Livingston",
  "Lodge Grass",
  "Malta",
  "Manhattan",
  "Medicine Lake",
  "Melstone",
  "Miles City",
  "Missoula",
  "Moore",
  "Nashua",
  "Neihart",
  "Opheim",
  "Outlook",
  "Philipsburg",
  "Pinesdale",
  "Plains",
  "Plentywood",
  "Plevna",
  "Polson",
  "Poplar",
  "Red Lodge",
  "Rexford",
  "Richey",
  "Ronan",
  "Roundup",
  "Ryegate",
  "Saco",
  "Scobey",
  "Shelby",
  "Sheridan",
  "Sidney",
  "St. Ignatius",
  "Stanford",
  "Stevensville",
  "Sunburst",
  "Superior",
  "Terry",
  "Thompson Falls",
  "Three Forks",
  "Townsend",
  "Troy",
  "Twin Bridges",
  "Valier",
  "Virginia City",
  "Walkerville",
  "West Yellowstone",
  "Westby",
  "White Sulphur Springs",
  "Whitefish",
  "Whitehall",
  "Wibaux",
  "Winifred",
  "Winnett",
  "Wolf Point"
];

// Color schemes from Colorbrewer
var colorsPop = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
var colorsPopSparser = ['#FFEDA0', '#FEB24C', '#FC4E2A', '#BD0026', '#800026'];
var colors6QualSet2 = ['#66C2A5', '#FC8D62', '#8DA0CB', '#E78AC3', '#A6D854', '#FFD92F'];
var colors15QualSet3 = ['#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3', '#FDB462', '#B3DE69', '#FCCDE5', '#AAAAAA', '#BC80BD', '#CCEBC5', '#FFED6F', '#E31A1C', '#33A02C', '#1F78B4']; // colors12QualSet3 + last 3

// Map attributes depending on field type
var city_map_attr = {
  'Population': {
    'breaks': [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    'colors': colorsPop
  },
  'Class': {
    breaks: ['1', '2', '3', 'Town'],
    colors: colors6QualSet2
  },
  /* Income for cities not displayed on wallcharts
  'Income': {
    breaks: [0, 10000, 20000, 30000, 40000, 50000, 60000],
    colors: colorsPop
  }, */
  'Taxable Valuation (Mill Value)': {
    breaks: [0, 2000, 5000, 10000, 50000, 100000, 200000],
    colors: colorsPop
  },
  'General Fund Mills Levied': {
    breaks: [0, 50, 100, 200, 300, 400],
    colors: colorsPop
  },
  'Total Mills Levied': {
    breaks: [0, 100, 200, 300, 400, 500, 600],
    colors: colorsPop
  },
  'General Funds Appropriated': {
    breaks: [0, 10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000],
    colors: colorsPop
  },
  'Total Funds Appropriated': {
    breaks: [0, 10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000],
    colors: colorsPop
  },
  'FTE': {
    breaks: [5, 10, 50, 100, 200, 500],
    colors: colors15QualSet3
  },
  'Road Miles': {
    breaks: [0, 10, 50, 100, 200, 500],
    colors: colorsPop
  },
  'Council Size': {
    breaks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    colors: colors15QualSet3
  },
  'Form of Government': {
    breaks: ['Com', 'Com(A)', 'Com(C)', 'Com PO', 'Com Ex', 'Com Ex(A)', 'Com Ex(C)', 'Mgr', 'Mgr(A)', 'Mgr(C)', 'TM(C)'],
    //breaks: ['Charter', 'Com-ch', 'Com-ex', 'Com-ex (a)', 'Com-ex (c)', 'Mgr', 'Mgr (a)', 'Mgr (c)', 'TM (c)'],
    //colors: colors6QualSet2 // TODO more colors?
    colors: colors15QualSet3
  },
  'Type of Election': {
    breaks: ['Np', 'P'],
    colors: colors6QualSet2
  },
  'Government Powers': {
    breaks: ['Gen', 'Self'],
    colors: colors6QualSet2
  }
};

// Assign city lists to generic list names
var table_fields = city_table_fields;
var numeric_fields = city_numeric_fields;
var historical_fields = city_historical_fields;
var comparison_fields = city_comparison_fields;
var map_fields = city_map_fields;
var info_fields = city_info_fields;
var order_fields = city_order_fields;
var map_attr = city_map_attr;
var all_names = all_cities;
var all_classes = city_all_classes;
