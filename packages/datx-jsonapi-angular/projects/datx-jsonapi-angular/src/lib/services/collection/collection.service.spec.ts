import { Inject, Injectable } from '@angular/core';
import { Attribute, Collection, Model } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';
import { of } from 'rxjs';
import { APP_COLLECTION } from '../../injection-tokens';
import { jsonapiAngular } from '../../mixin';
import { Response } from '../../Response';
import { CollectionService } from './collection.service';

export class User extends jsonapiAngular(Model) {
  public static endpoint = 'users';
  public static type = 'user';

  @Attribute()
  public name!: string;
}

class AppCollection extends jsonapiAngular(Collection) {
  public static types = [User];
}

@Injectable()
class TestModelService extends CollectionService<User, AppCollection> {
  protected ctor = User;

  constructor(@Inject(APP_COLLECTION) protected readonly collection: AppCollection) {
    super(collection);
  }
}

describe('CollectionService', () => {
  let service: TestModelService;
  let appCollection: AppCollection;

  beforeEach(() => {
    appCollection = new AppCollection();
    service = new TestModelService(appCollection);

    jest
      .spyOn(appCollection, 'getMany')
      .mockReturnValue(
        of({ data: [new User({ name: 'John' }), new User({ name: 'Jane' })] } as Response<User>),
      );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getMany should make a get many call', (done) => {
    const requestOptions: IRequestOptions = { queryParams: {} };

    service.getMany(requestOptions).subscribe((response) => {
      expect(appCollection.getMany).toHaveBeenCalledWith(User, requestOptions);
      expect(response.data.length).toBe(2);
      done();
    });
  });

  it('#getManyModels should make a get many models call', (done) => {
    const requestOptions: IRequestOptions = { queryParams: {} };

    service.getManyModels(requestOptions).subscribe((models) => {
      expect(appCollection.getMany).toHaveBeenCalledWith(User, requestOptions);
      expect(models.length).toBe(2);
      expect(models[0].name).toBe('John');
      expect(models[1].name).toBe('Jane');
      done();
    });
  });

  it('#create should create a new new model and add it to the collection', () => {
    jest.spyOn(appCollection, 'add');

    const name = 'Hrvatko';
    const newModel = service.create({ name });

    expect(appCollection.add).toHaveBeenCalledTimes(1);
    expect(newModel).toBeInstanceOf(User);
    expect(newModel.name).toBe(name);
  });

  it('#createAndSave should create a model and save it (API call)', async () => {
    jest.spyOn(appCollection, 'add');
    jest.spyOn(service, 'update').mockImplementation((model: User) => of(model));

    const name = 'Hrvatko';
    const savedModel = await service.createAndSave({ name }).toPromise();

    expect(appCollection.add).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledTimes(1);
    expect(savedModel).toBeInstanceOf(User);
    expect(savedModel?.name).toBe(name);
  });
});
