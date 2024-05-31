import { TestBed } from '@angular/core/testing';

import { ToasterNotificationService } from './toaster-notification.service';

describe('ToasterNotificationService', () => {
  let service: ToasterNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToasterNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
