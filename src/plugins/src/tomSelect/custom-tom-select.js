// Basic

new TomSelect("#input-tags",{
	persist: false,
	createOnBlur: true,
	create: true
});


// Select Box

new TomSelect("#select-beast",{
	create: true,
	sortField: {
		field: "text",
		direction: "asc"
	}
});


// Multi Select

new TomSelect("#select-state",{
    maxItems: 3
});


// Disabled Option

new TomSelect("#select-beast-single-disabled",{
	create: true,
	sortField: {field: "text"}
});


// Disabled Select

new TomSelect("#select-beast-disabled");



//  Removal Buttons

new TomSelect('#removal-button', {
	plugins: {
		remove_button:{
			title:'Remove this item',
		}
	},
	persist: false,
	create: true,
	onDelete: function(values) {
		return confirm(values.length > 1 ? 'Are you sure you want to remove these ' + values.length + ' items?' : 'Are you sure you want to remove "' + values[0] + '"?');
	}
});


//  Drag 'n Drop

new TomSelect('#drag-n-drop',{
	plugins: ['drag_drop'],
	persist: false,
	create: true
});




// Option Group Columns

new TomSelect("#option-group-columns",{
	options: [
		{id: 'avenger', make: 'dodge', model: 'Avenger'},
		{id: 'caliber', make: 'dodge', model: 'Caliber'},
		{id: 'caravan-grand-passenger', make: 'dodge', model: 'Caravan Grand Passenger'},
		{id: 'challenger', make: 'dodge', model: 'Challenger'},
		{id: 'ram-1500', make: 'dodge', model: 'Ram 1500'},
		{id: 'viper', make: 'dodge', model: 'Viper'},
		{id: 'a3', make: 'audi', model: 'A3'},
		{id: 'a6', make: 'audi', model: 'A6'},
		{id: 'r8', make: 'audi', model: 'R8'},
		{id: 'rs-4', make: 'audi', model: 'RS 4'},
		{id: 's4', make: 'audi', model: 'S4'},
		{id: 's8', make: 'audi', model: 'S8'},
		{id: 'tt', make: 'audi', model: 'TT'},
		{id: 'avalanche', make: 'chevrolet', model: 'Avalanche'},
		{id: 'aveo', make: 'chevrolet', model: 'Aveo'},
		{id: 'cobalt', make: 'chevrolet', model: 'Cobalt'},
		{id: 'silverado', make: 'chevrolet', model: 'Silverado'},
		{id: 'suburban', make: 'chevrolet', model: 'Suburban'},
		{id: 'tahoe', make: 'chevrolet', model: 'Tahoe'},
		{id: 'trail-blazer', make: 'chevrolet', model: 'TrailBlazer'},
	],
	optgroups: [
		{$order: 3, id: 'dodge', name: 'Dodge'},
		{$order: 2, id: 'audi', name: 'Audi'},
		{$order: 1, id: 'chevrolet', name: 'Chevrolet'}
	],
	labelField: 'model',
	valueField: 'id',
	optgroupField: 'make',
	optgroupLabelField: 'name',
	optgroupValueField: 'id',
	lockOptgroupOrder: true,
	searchField: ['model'],
	plugins: ['optgroup_columns'],
	openOnFocus: false
});




// Dropdown Header

new TomSelect('#dropdown-header',{
	sortField: 'text',
	hideSelected: false,
	plugins: {
		'dropdown_header': {
			title: 'Language'
		}
	}
});








