import { hospitals } from '@/features/hospitals/data/hospitals'
import { faker } from '@faker-js/faker'

export const doctors = Array.from({ length: 20 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    username: faker.internet
      .username({ firstName, lastName })
      .toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([
      'active',
      'inactive',
      'invited',
      'suspended',
    ]),
    department: faker.helpers.arrayElement([
      'REVIEW',
      'PC',
      'ED',
      'OPD'
    ]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    hospitalId: faker.helpers.arrayElement(hospitals).id,
  }
})
