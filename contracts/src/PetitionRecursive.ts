import { Field, Poseidon, Struct, CircuitString, Bool } from 'o1js';

export class Petition extends Struct({
  petitionId: Field,

  title: CircuitString,

  description: CircuitString,

  petitionCount: Field,

  isActive: Bool})
  {
    /**
   * Hashes all the details of the petition into a single Field element.
   * It converts string and boolean values into Field elements and then
   * combines them with the other Field properties before applying the Poseidon hash.
   *
   * @returns {Field} A Field element representing the hash of the petition.
   */
  hash(): Field {
    
    // Return the Poseidon hash of the combined fields.
    return Poseidon.hash([this.petitionId,
      this.title.hash(),
      this.description.hash(),
      this.petitionCount,
      this.isActive.toField()]);
  }

  /**
   * Returns a new Petition instance with the petitionCount incremented by one.
   *
   * @returns {Petition} A new Petition with an incremented petitionCount.
   */
  setPetitionCount(newCountcount: Field) {
    return new Petition({
      petitionId: this.petitionId,
      title: this.title,
      description: this.description,
      petitionCount: newCountcount,
      isActive: this.isActive
    });
  }

}
