export const problems = [
  {
    id: 'parking-lot', title: 'Parking Lot', difficulty: 'Medium', category: 'Object modelling', estimatedMinutes: 35,
    summary: 'Design a parking lot that supports multiple vehicle and spot types.',
    description: 'Build an object-oriented design for a parking lot used by cars, motorcycles, and trucks. The lot has multiple floors and different spot sizes. A vehicle should be assigned a compatible spot when it enters and released when it exits.',
    requirements: [
      'Support motorcycle, car, and truck vehicle types.',
      'Support compact, regular, and large parking spots across multiple floors.',
      'Assign a compatible available spot on entry and release it on exit.',
      'Prevent a spot from being occupied by more than one vehicle.',
      'Make it possible to add a new vehicle or pricing policy with limited changes.'
    ],
    considerations: ['How do you model vehicle-to-spot compatibility?', 'Who owns allocation and release behaviour?', 'How would pricing or reservation rules be added later?'],
    expectedConcepts: ['encapsulation', 'single responsibility', 'polymorphism', 'composition', 'extensibility']
  },
  {
    id: 'elevator-system', title: 'Elevator System', difficulty: 'Hard', category: 'State & behaviour', estimatedMinutes: 45,
    summary: 'Model elevators, requests, scheduling, and movement safely.',
    description: 'Design a building elevator system with multiple elevators and floors. Users can request an elevator from a floor or select a destination inside one. The system decides which elevator should handle each request and tracks movement and door state.',
    requirements: [
      'Represent multiple elevators, their current floor, direction, and door state.',
      'Support hall calls and in-car destination requests.',
      'Separate request assignment policy from elevator movement.',
      'Prevent unsafe transitions such as moving with doors open.',
      'Allow a different scheduling strategy without rewriting elevator behaviour.'
    ],
    considerations: ['What belongs to Elevator versus Dispatcher?', 'How will you represent states and valid transitions?', 'How can scheduling policies be swapped or tested independently?'],
    expectedConcepts: ['state', 'strategy', 'encapsulation', 'single responsibility', 'interfaces']
  },
  {
    id: 'vending-machine', title: 'Vending Machine', difficulty: 'Easy', category: 'State & transactions', estimatedMinutes: 30,
    summary: 'Design product selection, payments, inventory, and refunds.',
    description: 'Create a vending machine that sells products from slots. A user selects a product, inserts money, confirms the purchase, and receives the product and change. The machine must handle sold-out products and insufficient payment.',
    requirements: [
      'Represent products, slots, prices, and inventory quantities.',
      'Support selection, payment, purchase, and change/refund behaviour.',
      'Handle sold-out products and insufficient payment without losing money.',
      'Keep inventory updates consistent when a purchase succeeds.',
      'Allow payment behaviour to support another payment method later.'
    ],
    considerations: ['Would a state machine simplify the workflow?', 'Who is responsible for inventory changes and refunds?', 'How will failed purchases avoid partially updating state?'],
    expectedConcepts: ['state', 'encapsulation', 'single responsibility', 'interfaces', 'error handling']
  }
];
