import React from 'react';


import { Container, Content, H1, Text, View} from 'native-base';
import { useRoute } from '@react-navigation/native';


export default function NotFoundScreen(){
  const {params:{id}} = useRoute();
  return(<Container>
    <Content>
    <Container>
      <Content>
          <H1 primary style={{paddingVertical:50, textAlign:"center"}}>Page non trouvée</H1>
          <View>
            <Text style={{textAlign:"center"}}>Aucune page trouvée ayant l'id "{id}"</Text>
          </View>
      </Content>
    </Container>
    </Content>
  </Container>)
}
