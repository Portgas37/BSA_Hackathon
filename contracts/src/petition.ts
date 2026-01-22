import { Field, Poseidon, Struct, CircuitString, Bool } from 'o1js';

export class Petition extends Struct({
  petitionId: Field,
  title: CircuitString,
  description: CircuitString,
  petitionCount: Field,
  isActive: Bool,
}) {
  hash(): Field {
    return Poseidon.hash([
      this.petitionId,
      this.title.hash(),
      this.description.hash(),
      this.petitionCount,
      this.isActive.toField(),
    ]);
  }

  incrementCount(): Petition {
    return new Petition({
      petitionId: this.petitionId,
      title: this.title,
      description: this.description,
      petitionCount: this.petitionCount.add(Field(1)),
      isActive: this.isActive,
    });
  }

  setPetitionCount(newCount: Field): Petition {
    return new Petition({
      petitionId: this.petitionId,
      title: this.title,
      description: this.description,
      petitionCount: newCount,
      isActive: this.isActive,
    });
  }
}
