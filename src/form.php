<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        $organisation = '-';
        $email = $_POST['email'];
        $name = $_POST['name'];

        if(isset($_POST['organisation'])) {
            $organisation = $_POST['organisation'];
        }

        //CHANGE HERE
        $to =           'info@wisselwerkers,mc@henp.nl';
        $subject =      'Contact Request: ';
        $message =      'Contact request from</br>' .
                        '<b>Name: </b>' . $name . '</br>'  .
                        '<b>E-Mail: </b>' . $email . '</br>'  .
                        '<b>Organisation: </b>' . $organisation . '</br>'  ;
        $headers =      'FROM: contact-form@canvasheroes.com' . "\r\n" .
                        'Reply-To: ' . $email . "\r\n" .
                        "Content-type: text/html; charset=\"UTF-8\"; format=flowed \r\n" .
                        'X-Mailer: PHP/' . phpversion();

        $result = mail($to, $subject, $message, $headers);
        echo json_encode($result);
    }
?>