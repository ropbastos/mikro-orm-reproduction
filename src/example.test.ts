import { Entity, MikroORM, PrimaryKey, Property, ScalarReference } from '@mikro-orm/sqlite';

@Entity()
class User {

  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @Property({ unique: true })
  email: string;

  @Property({
    type: 'text',
    nullable: true,
    lazy: true,
    ref: true
  })
  reallyBigBio!: ScalarReference<string | null>;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [User],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example', async () => {
  orm.em.create(User, { name: 'Foo', email: 'foo', reallyBigBio: null });
  await orm.em.flush();
  orm.em.clear();

  const user = await orm.em.findOneOrFail(User, { email: 'foo' });
  expect(user.reallyBigBio.isInitialized()).toBe(false);
  //@ts-expect-error $ should be undefined if not yet populated.
  const whatever = user.reallyBigBio.$

  const userWithBioPopulated = await orm.em.populate(user, ['reallyBigBio']);

  // This typechecks
  const definitelyAString: string = userWithBioPopulated.reallyBigBio.$
  const doSomethingWithString = (s: string) => {
    const something = s.replace('foo', 'bar');
    return something;
  }

  // Oops
  expect(() => doSomethingWithString(definitelyAString)).toThrow();
});
