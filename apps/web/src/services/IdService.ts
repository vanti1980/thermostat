
class IdService {
  retrieveId(): string | null {
    return window.localStorage.getItem('id');
  }

  storeId(id: string): void {
    return window.localStorage.setItem('id', id);
  }
}

export default new IdService();
